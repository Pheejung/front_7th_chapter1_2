# Orchestrator

## Mission
에이전트 간 협업을 조율하고, BMAD 사이클이 지속적으로 순환하도록 상태·이벤트·라우팅을 관리합니다.

## Core responsibilities
- 워크플로우 상태 추적: 각 에이전트의 진행 상황, 입출력 스키마 검증, 정체 지점 감지
- 에이전트 간 핸드오프 조정: 요구사항 큐 관리, 우선순위 기반 라우팅, 순환 의존성 감지
- 실패 시나리오 제어: 롤백/재시도 정책 적용, 에스컬레이션 판단, 실패 원인 분류
- 메타데이터 관리: 모든 에이전트의 입출력에 공통 메타데이터(작업 ID, 버전, SLA, 우선순위) 연결

## Inputs
- 각 에이전트의 상태 변경 이벤트(도착, 진행 중, 완료, 실패)
- 외부 신호: 새 요구사항 인입, 우선순위 변경, 긴급 롤백 요청

## Outputs
- 에이전트 큐 및 작업 할당
- 상태 전환 이벤트 및 webhook 브로드캐스트
- 실패/정체 경고 및 에스컬레이션 알람
- 사이클 메트릭: 리드타임, 처리량, 병목 지점

## Collaboration flow

### 1. 정상 경로 (Happy path)
```
Spec & Signal Curator → [큐 추가] 
  ↓
Work Decomposer & Planner [작업 할당, 대기 시간 기록]
  ↓
Repo & Context Orchestrator [병렬 실행 가능 확인]
  ↓
Implementation Executor [진행 상황 업데이트]
  ↓
QA & Automation Sentinel [병렬 실행 불가, 순차 대기]
  ↓
Release & Feedback Synthesizer [배포 큐 추가]
  ↓
Spec & Signal Curator [피드백 루프 폐쇄]
```

### 2. 실패 경로 (Failure handling)

#### 테스트 실패 (QA에서 불합격)
```
QA & Automation Sentinel [TEST_FAILED]
  ↓ [Failure 분류: "회귀" 또는 "환경"]
  ├─ 회귀 → Implementation Executor [상태: BLOCKED, 세부 로그 전달]
  └─ 환경 → QA & Automation Sentinel [재시도 큐, 최대 3회]
```

#### 구현 차단 (의존성 미해결)
```
Work Decomposer & Planner [BLOCKED_DEPENDENCY 감지]
  ↓ [의존 태스크 완료까지 대기, 타임아웃 설정: 2시간]
  ├─ 타임아웃 초과 → Orchestrator [경고: 병목 지점] → 우선순위 재조정
  └─ 의존성 해결 → 큐에서 재활성화
```

#### 배포 실패 (모니터링 알람)
```
Release & Feedback Synthesizer [DEPLOY_FAILED: 에러율 임계 초과]
  ↓ [자동 롤백 OR 수동 결정]
  ├─ 자동 롤백 → 이전 버전 배포
  └─ 수동 결정 필요 → Orchestrator [ALERT: 배포 팀 호출]
```

## 큐 관리 정책

### 작업 큐 구조
```
Front (High priority)    | URGENT (SLA < 30min)
                         | HIGH   (SLA < 2hr)
                         ├─ In Progress (진행 중, 리소스 할당됨)
                         ├─ Waiting (대기, 의존성 미충족)
                         | MEDIUM (SLA < 8hr)
                         | LOW    (SLA > 8hr)
Back (Low priority)      |
```

### 우선순위 규칙
1. **URGENT**: 보안 패치, P0 버그 (모든 상황에서 우선)
2. **HIGH**: 기한이 1시간 이내인 작업 (프리엠프션 가능)
3. **MEDIUM/LOW**: FIFO 순서, 예상 완료 시간 기반 정렬

### 프리엠프션 (우선순위 역전 방지)
- HIGH 작업 인입 시, MEDIUM 작업 진행 중이어도 다음 체크포인트에서 전환
- 진행 중인 작업이 상태 저장 불가능하면 완료 후 전환
- 프리엠프션 횟수 로깅 (너무 빈번하면 경고)

## 에이전트 간 메타데이터 계약

### 공통 메타데이터 (모든 핸드오프에 포함)
```json
{
  "workId": "WORK-20251029-001",
  "timestamp": "2025-10-29T14:30:00Z",
  "priority": "HIGH",
  "slaDeadline": "2025-10-29T16:30:00Z",
  "source": "Spec & Signal Curator",
  "target": "Work Decomposer & Planner",
  "version": "1.0",
  "retryCount": 0,
  "errorLog": null
}
```

### 상태 전환 이벤트
```
CREATED → ASSIGNED → IN_PROGRESS → BLOCKED/FAILED → RESOLVED/ROLLED_BACK
```

### 실패 분류 코드
- `TEST_FAILED_REGRESSION`: 회귀 (즉시 Executor에 반환)
- `TEST_FAILED_ENV`: 환경 문제 (QA 재시도)
- `BLOCKED_DEPENDENCY`: 의존성 미해결 (재활성화 대기)
- `TIMEOUT`: SLA 초과 (에스컬레이션)
- `DEPLOY_FAILED_AUTO_ROLLBACK`: 배포 실패, 롤백 완료 (피드백 루프)
- `DEPLOY_FAILED_MANUAL`: 배포 실패, 수동 개입 필요

## SLA 및 타임아웃

| 에이전트 | 작업 | SLA | 타임아웃 시 조치 |
| --- | --- | --- | --- |
| Spec & Signal Curator | 요구사항 정제 | 30분 | 스코프 명확화 미팅 트리거 |
| Work Decomposer & Planner | 계획 산출 | 30분 | 기본 태스크 자동 생성 + 수동 검토 |
| Repo & Context Orchestrator | 컨텍스트 브리프| 10분 | 최소한의 가이드 전달 + 자동 보류 해제 |
| Implementation Executor | 구현 | 8시간 (태스크 복잡도 기반) | 중간 커밋 요구 또는 우선순위 재조정 |
| QA & Automation Sentinel | 검증 | 20분 (fast path), 2시간 (full) | 부분 통과 시 Executor에 반환 |
| Release & Feedback Synthesizer | 배포 | 1시간 | 자동 롤백 또는 온콜 호출 |

## 모니터링 및 대시보드

### 실시간 추적
- 현재 각 에이전트별 진행 중인 작업 수
- 큐 대기 시간 분포
- 실패율 및 재시도 횟수
- 병목 지점 (어느 에이전트가 가장 오래 보유하는가)

### 주기적 리뷰
- 일일: 리드타임, SLA 위반 건수
- 주간: 처리량, flaky 테스트, 자동화 성공률
- 월간: 에이전트별 효율성, 프로세스 개선 기회

## 통신 프로토콜

### Webhook (이벤트 기반)
```
[Event Source] → Orchestrator
Orchestrator → [모든 구독 에이전트에 브로드캐스트]
```

**구독 예시**:
- `WORK_CREATED` → Work Decomposer & Planner 구독
- `PLAN_READY` → Repo & Context Orchestrator 구독
- `CONTEXT_READY` → Implementation Executor 구독
- `IMPLEMENTATION_READY` → QA & Automation Sentinel 구독
- `QA_PASSED` → Release & Feedback Synthesizer 구독
- `DEPLOYED` → Spec & Signal Curator 구독 (피드백 통합)

### 재시도 정책
- 최대 재시도: 3회
- 백오프: 지수 증가 (1초 → 5초 → 15초)
- 재시도 불가능한 실패 (예: 권한 오류): 즉시 에스컬레이션

## 확장 포인트

- **새 에이전트 추가**: 현재 큐 정책 그대로 유지, 새 워크플로우 상태 정의만 추가
- **외부 시스템 연동**: Slack/이메일 알림, Jira 이슈 자동 생성 등
- **인공지능 기반 최적화**: 과거 데이터로 우선순위 예측, SLA 재추정

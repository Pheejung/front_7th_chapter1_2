# BMAD 에이전트 기반 자동 개발 워크플로우

## 개요

BMAD(Build → Measure → Analyze → Deploy) 사이클을 자동화하기 위해 6개의 전문화된 에이전트를 구성합니다. 이 문서는 에이전트별 역할, 상호작용 흐름, 품질 게이트, 그리고 [`docs/testing-guidelines.md`](./testing-guidelines.md)에 정의된 테스트 원칙을 워크플로우에 어떻게 통합하는지 설명합니다. 각 에이전트의 세부 책임과 운영 지침은 [`docs/agents/`](./agents) 디렉터리의 개별 문서를 참고하세요.

## 에이전트 역할 매트릭스

| 에이전트                                                                     | 핵심 미션                                   | 주요 입력                                                          | 주요 출력                               | 책임 범위                     | 테스트 연계                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------- | ----------------------------- | --------------------------------------------------------- |
| [**Spec & Signal Curator**](agents/product-spec-curator.md)                  | 비즈니스/사용자 요구를 표준 템플릿으로 정리 | PRD, BMAD 명세, 피드백                                             | 구조화된 요구사항 캔버스, 우선순위 태그 | 요구사항 정확도, 변경 추적    | 테스트 범위 선언 (필수/옵션 시나리오)                     |
| [**Work Decomposer & Planner**](agents/work-decomposer-planner.md)           | 요구사항을 실행 가능한 태스크로 분해        | Spec & Signal Curator 캔버스, 기술 부채 목록                       | 태스크 DAG, SLA, 위험도 라벨            | 일정/리소스 계획, 의존성 관리 | 테스트 피라미드 기준으로 테스트 타입 할당                 |
| [**Repo & Context Orchestrator**](agents/repo-context-orchestrator.md)       | 코드/문서 자산을 매핑해 실행 문맥 제공      | 코드베이스, 변경 이력                                              | 관련 파일 매핑, 재사용 후보, 가이드     | 레포 스캐닝, 컨벤션 수호      | 유닛/통합 테스트 위치 및 픽스처 안내                      |
| [**Implementation Executor**](agents/implementation-executor.md)             | 계획된 변경을 코드/문서로 구현              | Work Decomposer & Planner 태스크, Repo & Context Orchestrator 문맥 | 커밋 후보, PR 요약, 변경 하이라이트     | 구현 품질, 스타일 준수        | FIRST 원칙에 맞게 선행 테스트 작성 (TDD)                  |
| [**QA & Automation Sentinel**](agents/qa-automation-sentinel.md)             | 변경을 자동 검증하고 회귀 방지              | Implementation Executor 변경, 테스트 스펙                          | 테스트 리포트, 품질 게이트 결과         | 테스트 파이프라인, 결함 분석  | 테스트 피라미드 실행 순서 관리 (Unit → Integration → E2E) |
| [**Release & Feedback Synthesizer**](agents/release-feedback-synthesizer.md) | 승인된 변경을 배포하고 학습 사이클 닫기     | QA & Automation Sentinel 승인, 배포 전략                           | 배포 로그, 피드백 요약, 후속 이슈       | 릴리즈, 모니터링, 롤백        | 배포 후 모니터링 테스트/스모크 테스트 수행                |

## 흐름 개요

1. **Discover (Spec & Signal Curator → Work Decomposer & Planner)**: Spec & Signal Curator가 요구사항을 캔버스로 변환하고 Work Decomposer & Planner가 이를 기반으로 태스크 DAG와 위험도를 산출합니다. Work Decomposer & Planner는 테스트 피라미드 기준으로 각 태스크에 필요한 테스트 범위를 정의합니다.
2. **Context Priming (Work Decomposer & Planner ↔ Repo & Context Orchestrator)**: Repo & Context Orchestrator는 관련 코드, 기존 테스트, 문서, 픽스처를 매핑해 Implementation Executor와 QA & Automation Sentinel이 재사용할 수 있도록 제공합니다.
3. **Implement (Repo & Context Orchestrator → Implementation Executor)**: Implementation Executor는 TDD 사이클(RED → GREEN → REFACTOR)을 따른 구현을 진행하며, [`testing-guidelines.md`](./testing-guidelines.md)의 AAA 패턴과 명명 규칙을 준수합니다.
4. **Verify (Implementation Executor ↔ QA & Automation Sentinel)**: QA & Automation Sentinel은 자동화된 품질 게이트를 실행합니다. 테스트는 FIRST 원칙을 지키며 단위 → 통합 → E2E 순으로 실행되고, MSW/Testing Library 지침에 맞게 환경을 구성합니다.
5. **Release & Learn (QA & Automation Sentinel → Release & Feedback Synthesizer → Spec & Signal Curator)**: Release & Feedback Synthesizer가 배포를 진행하고 모니터링/사용자 피드백을 수집해 Spec & Signal Curator에 전달, 다음 사이클에 반영합니다.

## 테스트 전략 통합

- **테스트 설계**: Work Decomposer & Planner는 요구사항을 분석해 필수 시나리오(통합/E2E)와 변형 케이스(유닛)를 태스크에 매핑합니다.
- **테스트 작성**: Implementation Executor는 구현 전에 RED 테스트를 작성하고 AAA 패턴, 의미 있는 테스트명, 결정론적 데이터 사용을 보장합니다.
- **테스트 실행**: QA & Automation Sentinel은 `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e` 순으로 파이프라인을 구성하며, 각 단계 실패 시 즉시 Implementation Executor에 피드백합니다.
- **테스트 자산 관리**: Repo & Context Orchestrator는 테스트 폴더 구조, 공용 픽스처, MSW 핸들러를 유지하고 재사용 가능성을 제안합니다.
- **커버리지 목표**: 유닛 80/75/90(Statement/Branch/Function), 통합 주요 시나리오 100%, E2E 핵심 happy path + 주요 에러 시나리오를 QA & Automation Sentinel이 상시 모니터링합니다.

## 품질 게이트

| 단계        | 체크 항목                  | 담당                                                      | 관련 가이드                         |
| ----------- | -------------------------- | --------------------------------------------------------- | ----------------------------------- |
| Pre-commit  | Lint, 타입 체크, 포맷      | Implementation Executor                                   | FIRST의 Fast/Timely, 테스트명 규칙  |
| CI 단계 1   | 유닛 테스트 & 커버리지     | QA & Automation Sentinel                                  | 테스트 피라미드 하단, AAA 패턴      |
| CI 단계 2   | 통합 테스트                | QA & Automation Sentinel                                  | 사용자 플로우, 상태 변화 검증       |
| CI 단계 3   | E2E/Smoke                  | QA & Automation Sentinel / Release & Feedback Synthesizer | 사용자 관점, 느린 테스트 분리       |
| Pre-release | 배포 체크리스트, 롤백 플랜 | Release & Feedback Synthesizer                            | 비결정 테스트 방지, 안정적인 셀렉터 |

## 커뮤니케이션 & 자동화 규칙

- 공통 메타데이터(작업 ID, 우선순위, 테스트 범위)를 모든 에이전트 출력에 포함합니다.
- 테스트 실패 시 QA & Automation Sentinel은 실패 유형(환경, flaky, 회귀)을 분류해 Implementation Executor와 Repo & Context Orchestrator에 통보합니다.
- 릴리즈 후 Release & Feedback Synthesizer는 모니터링 결과와 사용자 피드백을 Spec & Signal Curator에 전달하고, 커버리지/회귀 지표를 대시보드로 공유합니다.

## 운영 메트릭

- 리드타임(요구사항 → 배포), 자동 테스트 성공률, flaky 비율, 회귀 발생률
- 각 에이전트 SLA: Work Decomposer & Planner 계획 산출 < 30분, QA & Automation Sentinel 검증 < 20분, Release & Feedback Synthesizer 롤백 준비 < 5분 등
- 테스트 커버리지 추세와 테스트 실행 시간은 정기적으로 리뷰해 [`testing-guidelines.md`](./testing-guidelines.md)의 목표치를 유지합니다.

## 후속 제안

- 에이전트 간 메타데이터 스키마(JSON Schema) 정의
- 실패 시나리오 상태 머신 모델링으로 롤백/재시도 자동화
- 샌드박스 레포에서 정기적으로 E2E 리허설 수행해 테스트 안정성을 검증

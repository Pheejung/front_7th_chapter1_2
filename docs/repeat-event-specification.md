# 반복 일정 기능 명세서

> **작성**: 기획 에이전트 (Spec & Signal Curator)  
> **날짜**: 2025-10-30  
> **우선순위**: HIGH  
> **비즈니스 가치**: 사용자 편의성 증대, 일정 관리 생산성 향상  

---

## 📋 요구사항 캔버스

### 사용자 스토리
```
1. 사용자로서 나는 반복되는 일정(매일, 매주, 매월, 매년)을 한 번에 설정하고 싶다.
2. 사용자로서 나는 캘린더에서 반복 일정을 쉽게 구분할 수 있길 원한다.
3. 사용자로서 나는 반복 일정의 종료 날짜를 지정할 수 있길 원한다.
4. 사용자로서 나는 반복 일정 중 특정 일정만 수정하거나 전체를 수정할 수 있길 원한다.
5. 사용자로서 나는 반복 일정 중 특정 일정만 삭제하거나 전체를 삭제할 수 있길 원한다.
```

### 승인 기준 (Acceptance Criteria)

| # | 기능 | 승인 기준 | 우선순위 |
|---|------|---------|--------|
| 1 | 반복 타입 선택 | 일정 생성/수정 시 "매일, 매주, 매월, 매년" 선택 가능 | P0 |
| 2 | 월말 규칙 | 31일에 매월 반복 선택 시 → 31일에만 생성 | P0 |
| 3 | 윤년 규칙 | 2월 29일에 매년 반복 선택 시 → 29일에만 생성 | P0 |
| 4 | 반복 아이콘 표시 | 캘린더에서 반복 일정에 아이콘(🔄) 표시 | P0 |
| 5 | 반복 종료 조건 | 특정 날짜까지 반복 설정 가능 (최대: 2025-12-31) | P1 |
| 6 | 단일 수정 | "해당 일정만 수정" 선택 시 단일 수정 + 아이콘 제거 | P1 |
| 7 | 전체 수정 | "해당 일정만 수정? 아니오" 선택 시 전체 반복 일정 수정 + 아이콘 유지 | P1 |
| 8 | 단일 삭제 | "해당 일정만 삭제? 예" 선택 시 단일 일정만 삭제 | P1 |
| 9 | 전체 삭제 | "해당 일정만 삭제? 아니오" 선택 시 모든 반복 일정 삭제 | P1 |
| 10 | 겹침 무시 | 반복 일정은 일정 겹침 검증 대상 제외 | P2 |

---

## 🧪 테스트 범위 선언

### 테스트 피라미드 분배

**Phase 1: 반복 타입 선택 (1~3번 승인 기준)**
- **Unit Tests (70%)**: 
  - 유효한 반복 타입 검증 (daily, weekly, monthly, yearly)
  - 무효한 타입 거부
  - 31일 월간 반복 로직
  - 윤년 29일 연간 반복 로직
  
- **Integration Tests (25%)**:
  - 반복 타입 선택 시 DB 저장 확인
  - 형식 검증 (enum)
  
- **E2E Tests (5%)**:
  - 사용자가 반복 타입 드롭다운에서 선택 → 일정 생성 전체 흐름

**Phase 2: 반복 표시 (4번 승인 기준)**
- **Unit Tests (70%)**:
  - 반복 아이콘 생성 로직
  
- **Integration Tests (25%)**:
  - 캘린더 컴포넌트에서 반복 아이콘 렌더링
  
- **E2E Tests (5%)**:
  - 반복 일정 생성 후 캘린더에서 아이콘 표시 확인

**Phase 3: 반복 종료 및 수정/삭제 (5~9번 승인 기준)**
- **Unit Tests (70%)**:
  - 종료 날짜 검증
  - 단일/전체 수정 로직
  - 단일/전체 삭제 로직
  
- **Integration Tests (25%)**:
  - DB 쿼리 검증 (부분 vs 전체 업데이트)
  
- **E2E Tests (5%)**:
  - 사용자 선택 (예/아니오) → 올바른 수정/삭제 검증

---

## 🛠️ 기술 스펙

### Data Model (타입 정의)

```typescript
// 반복 일정 타입
type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | null;

// 반복 일정 메타데이터
interface RepeatEvent {
  id: string;
  parentId?: string; // 반복 일정의 부모 ID (단일 수정 시 추적용)
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  repeatType: RepeatType;
  repeatEndDate?: Date; // 반복 종료 날짜
  isRepeat: boolean; // 반복 여부 플래그
}

// 월간 반복 특수 규칙
interface MonthlyRepeatRule {
  dayOfMonth: number; // 1~31
  behavior: 'exact' | 'last-day'; // exact: 31일에만, last-day: 월말
}

// 연간 반복 특수 규칙
interface YearlyRepeatRule {
  month: number; // 0~11
  day: number; // 1~31
  isLeapYearOnly?: boolean; // 2월 29일인 경우만 true
}
```

### API 엔드포인트

```
POST /api/events
- Body: {title, date, repeatType, repeatEndDate}
- Return: {id, ...event}

PATCH /api/events/:id
- Body: {updates, scope: 'single' | 'all'}
- Return: {updatedCount, ...event}

DELETE /api/events/:id
- Body: {scope: 'single' | 'all'}
- Return: {deletedCount}
```

---

## 📊 우선순위 및 일정

### Phase 순서 (의존성 고려)

```
Phase 1 (반복 타입) ─→ Phase 2 (반복 표시) ─→ Phase 3 (종료/수정/삭제)
```

**Phase 1**: 2-3일 (반복 타입 선택 로직)  
**Phase 2**: 1-2일 (UI 표시)  
**Phase 3**: 3-4일 (복잡한 수정/삭제 로직)  

---

## ⚠️ 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|-----|
| 일정 겹침 검증과의 충돌 | 반복 일정이 겹침 검증에 걸릴 수 있음 | 반복 일정 플래그로 검증 제외 처리 |
| 대량 반복 일정 생성 성능 | 종료 날짜까지 모든 반복 일정 생성 시 DB 부하 | 레이지 로딩 또는 템플릿 기반 생성 |
| 부분 수정 후 일관성 | 일부 반복 일정만 수정되어 불일치 발생 | parentId로 추적, UI에서 명확한 선택 제공 |

---

## 🎯 성공 메트릭

- ✅ Phase 1 테스트 커버리지 80% 이상
- ✅ 엣지 케이스(31일/윤년) 100% 커버
- ✅ 수정/삭제 시 사용자 선택 UI 명확성 (UX 테스트)
- ✅ 반복 일정 1000개 생성 시 성능 < 2초

---

## 📝 다음 단계 (BMAD 에이전트 워크플로우)

```
1. ✅ 기획 에이전트 (Spec & Signal Curator)
   └─ 반복 일정 기능 명세서 작성 완료

2. → 계획 에이전트 (Work Decomposer & Planner)
   └─ 태스크 DAG & 스프린트 계획 작성

3. → 아키텍트 에이전트 (Repo & Context Orchestrator)
   ├─ 기존 코드 구조 분석
   ├─ 관련 파일 매핑
   └─ Context Brief & 테스트 자산 가이드 작성

4. → 개발 에이전트 (Implementation Executor)
   ├─ Task별 RED/GREEN/REFACTOR 사이클
   ├─ 테스트 먼저 작성 (TDD)
   └─ 한번에 하나의 기능만 완성

5. → QA 에이전트 (QA & Automation Sentinel)
   ├─ 자동 테스트 파이프라인 실행
   ├─ 품질 게이트 검증
   └─ 실패 분류 및 피드백

6. → 배포 에이전트 (Release & Feedback Synthesizer)
   ├─ 배포 준비 및 실행
   ├─ 모니터링 및 피드백 수집
   └─ 피드백을 기획 에이전트(1단계)로 전달
```

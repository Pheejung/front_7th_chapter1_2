# 반복 일정 기능 - 아키텍트 Context Brief

> **작성**: 아키텍트 에이전트 (Repo & Context Orchestrator)  
> **대상**: 개발 에이전트 (Implementation Executor)  
> **기반**: 반복 일정 명세서 + 태스크 DAG

---

## 📍 코드 구조 분석 (실제 코드 확인)

### 기존 타입 정의 (이미 존재!)

```typescript
// ✅ src/types.ts에 이미 정의됨
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo; // ← 이미 반복 정보 필드 있음!
  notificationTime: number;
}

export interface Event extends EventForm {
  id: string;
}
```

**상태**: ✅ 완벽하게 준비됨. RepeatType, RepeatInfo, 이미 Event에 연결됨

### 기존 Hook 구조 (실제 코드)

```typescript
// ✅ src/hooks/useEventOperations.ts
export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  // HTTP 메서드별 명확한 분리
  const saveEvent = async (eventData: Event | EventForm) => {
    if (editing) {
      // PUT /api/events/:id (수정)
    } else {
      // POST /api/events (생성)
    }
  };

  const deleteEvent = async (id: string) => {
    // DELETE /api/events/:id
  };

  return { events, fetchEvents, saveEvent, deleteEvent };
};
```

**상태**: ✅ 기본 CRUD 이미 구현됨. 반복 관련 로직만 추가하면 됨

### 기존 MSW 핸들러 (실제 코드 - 완벽한 구조)

```typescript
// ✅ src/__mocks__/handlers.ts (실제 코드)
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    // ... 수정 로직
    return HttpResponse.json({ ...events[index], ...updatedEvent });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    // ... 삭제 로직
    return new HttpResponse(null, { status: 204 });
  }),
];
```

**상태**: ✅ 모든 HTTP 메서드 완벽하게 구현됨. 반복 관련 상태만 업데이트하면 됨

### 기존 Form 구조 (App.tsx에 통합)

```typescript
// ✅ src/App.tsx (모든 폼이 여기 있음!)
// - useEventForm() 훅 사용
// - isRepeating, repeatType, repeatInterval, repeatEndDate 이미 정의됨
// - repeatType은 주석 처리 중 (사용 준비 상태)

const {
  isRepeating, // 반복 여부
  repeatType, // 반복 타입 (주석 처리됨 - Task R-001에서 활성화)
  repeatInterval, // 반복 간격
  repeatEndDate, // 반복 종료 날짜
} = useEventForm();
```

**상태**: ✅ 폼 구조는 완벽하게 준비됨. UI 렌더링만 추가하면 됨

---

## 🗂️ 관련 파일 매핑 (실제 코드 기반)

### Phase 1: 반복 타입 선택 (Task R-001 ~ R-003)

| 파일 경로                         | 기존 상태        | 수정 필요                                    | 담당 Task |
| --------------------------------- | ---------------- | -------------------------------------------- | --------- |
| `src/types.ts`                    | ✅ 완벽          | 확인만                                       | R-002     |
| `src/utils/`                      | 📁 디렉토리 있음 | **repeatUtils.ts 신규 생성**                 | R-001     |
| `src/hooks/useEventOperations.ts` | ✅ 있음          | **반복 저장 로직 = 기존 saveEvent 활용**     | R-002     |
| `src/App.tsx`                     | ✅ 있음          | **repeatType select UI 활성화**              | R-003     |
| `src/__mocks__/handlers.ts`       | ✅ 완벽          | **반복 필드 처리 자동 (기존 PUT/POST 활용)** | R-002     |

**중요**: EventForm.tsx 따로 없음! 모든 폼이 **App.tsx에 통합**되어 있음

### Phase 2: 반복 일정 표시 (Task R-004 ~ R-005)

| 파일 경로        | 기존 상태        | 수정 필요                              | 담당 Task    |
| ---------------- | ---------------- | -------------------------------------- | ------------ |
| `src/utils/`     | 📁 디렉토리 있음 | **getRepeatIcon() 함수 추가**          | R-004        |
| `src/App.tsx`    | ✅ 있음          | **캘린더/테이블에 반복 아이콘 렌더링** | R-005        |
| `src/__tests__/` | ✅ 있음          | **반복 테스트 케이스 추가**            | R-004, R-005 |

### Phase 3: 반복 수정/삭제 (Task R-006 ~ R-012)

| 파일 경로                         | 기존 상태 | 수정 필요                                             | 담당 Task           |
| --------------------------------- | --------- | ----------------------------------------------------- | ------------------- |
| `src/utils/repeatUtils.ts`        | � 신규    | **generateRepeatEvents(), updateRepeatEvents() 추가** | R-006, R-007, R-008 |
| `src/hooks/useEventOperations.ts` | ✅ 있음   | **기존 deleteEvent 활용 + 반복 옵션 처리**            | R-010, R-011        |
| `src/App.tsx`                     | ✅ 있음   | **수정/삭제 모달 UI 추가**                            | R-009, R-012        |
| `src/__mocks__/handlers.ts`       | ✅ 완벽   | **반복 필드 처리 자동**                               | R-007~R-011         |

---

## 🧪 테스트 자산 인벤토리

### 1. 기존 테스트 구조

```
src/__tests__/
├── unit/
│   ├── easy.dateUtils.spec.ts          ✅ 날짜 유틸 테스트 (참고용)
│   ├── easy.eventOverlap.spec.ts       ✅ 겹침 검증 테스트 (참고용)
│   └── easy.eventUtils.spec.ts         ✅ 이벤트 유틸 테스트 (참고용)
├── hooks/
│   └── medium.useEventOperations.spec.ts ✅ 훅 테스트 (참고용)
├── medium.integration.spec.tsx         ✅ 통합 테스트
└── utils.ts                            ✅ 공용 테스트 유틸
```

### 2. MSW 핸들러 현황

```
src/__mocks__/
├── handlers.ts              ✅ 기존 이벤트 API mock
├── handlersUtils.ts         ✅ 유틸 함수
└── response/
    ├── events.json         ✅ 이벤트 fixture
    └── realEvents.json     ✅ 실제 이벤트 샘플
```

**필요한 추가 작업**:

- `반복 일정 저장` MSW mock handler 추가 (R-002)
- `반복 일정 수정` MSW mock handler 추가 (R-007, R-008)
- `반복 일정 삭제` MSW mock handler 추가 (R-010, R-011)

### 3. 테스트 유틸 함수 (참고용)

```typescript
// src/__tests__/utils.ts에서 사용 가능
- renderWithProviders()    // MSW + React Query + Theme 포함
- mockDate()              // vi.setSystemTime 래퍼
- waitForAsync()          // 비동기 대기

// 참고: dateUtils 테스트에서 사용하는 패턴
- 윤년 검증: new Date('2024-02-29')
- 월말 계산: date.setDate(32)로 월말 계산
```

---

## 📋 Task별 파일 할당

### TASK-R-001: 반복 타입 유틸 함수

**파일 생성**: `src/utils/repeatUtils.ts`

```typescript
// 필요한 함수
export const isValidRepeatType = (type: string): boolean => { ... }
export const getMonthlyRepeatDates = (startDate: Date, endDate?: Date): Date[] => { ... }
export const getYearlyRepeatDates = (startDate: Date, endDate?: Date): Date[] => { ... }
export const isLeapYear = (year: number): boolean => { ... }
```

**테스트 파일**: `src/__tests__/unit/easy.repeatUtils.spec.ts` (신규)

---

### TASK-R-002: RepeatEvent 타입 정의 & 훅

**수정 파일**:

- `src/types.ts` (기존 RepeatInfo 확인 후 필요시 확장)
- `src/hooks/useEventOperations.ts` (반복 저장 로직 추가)
- `src/__mocks__/handlers.ts` (반복 저장 API mock)

**테스트**: `src/__tests__/unit/easy.repeatTypes.spec.ts` (신규)

---

### TASK-R-003: 일정 폼 UI 확장

**수정 파일**:

- `src/components/EventForm.tsx` (반복 타입 select 추가)

**테스트**: `src/__tests__/medium.repeatForm.spec.tsx` (신규)

---

### TASK-R-004: 반복 아이콘 렌더 함수

**파일 추가**: `src/utils/repeatUtils.ts`에 함수 추가

```typescript
export const getRepeatIcon = (repeatType: RepeatType): string => {
  const icons: Record<RepeatType, string> = {
    none: '',
    daily: '📅',
    weekly: '🔄',
    monthly: '📆',
    yearly: '🗓️',
  };
  return icons[repeatType] || '';
};
```

**테스트**: `src/__tests__/unit/easy.repeatIcon.spec.ts` (신규)

---

### TASK-R-005: Calendar 컴포넌트 확장

**수정 파일**:

- `src/components/Calendar.tsx` (아이콘 렌더링 로직)

**테스트**: `src/__tests__/medium.calendarRepeat.spec.tsx` (신규)

---

### TASK-R-006: 반복 일정 생성 로직

**파일 추가**: `src/utils/repeatUtils.ts`에 함수 추가

```typescript
export const generateRepeatEvents = (
  event: Event,
  repeatType: RepeatType,
  endDate?: string
): Event[] => { ... }
```

**테스트**: `src/__tests__/unit/medium.repeatGeneration.spec.ts` (신규)

---

## 🔄 기존 MSW 핸들러 (실제 코드 - 완벽한 구조)

```typescript
// src/__mocks__/handlers.ts
// 반복 필드도 자동으로 처리됨 (EventForm에 repeat 필드 있으면 그대로 저장)

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(events.length + 1);
    // ✅ repeat 필드도 newEvent에 포함되어 자동 처리됨
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);
    if (index !== -1) {
      // ✅ repeat 필드 포함해서 전체 업데이트 가능
      return HttpResponse.json({ ...events[index], ...updatedEvent });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);
    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
```

**핵심**:

- ✅ 반복 필드 처리는 **이미 자동으로 됨** (generic Event 타입)
- ✅ 추가 mock 작성 불필요
- ✅ **반복 로직은 클라이언트에서 처리** (generateRepeatEvents 등)

---

## 📐 코드 컨벤션 (기존 프로젝트 준수)

### 파일 명명 규칙

```
테스트: [난이도].[기능].spec.[ts|tsx]
  ✅ easy.dateUtils.spec.ts
  ✅ medium.integration.spec.tsx

유틸: [기능]Utils.ts
  ✅ dateUtils.ts
  ✅ eventUtils.ts
  ✅ repeatUtils.ts (신규)
```

### 테스트 패턴 (AAA)

```typescript
describe('테스트 대상', () => {
  it('should do something', () => {
    // Arrange
    const input = ...;

    // Act
    const result = func(input);

    // Assert
    expect(result).toBe(...);
  });
});
```

### 타입스크립트 규칙

```typescript
// ✅ 명시적 타입
function isLeapYear(year: number): boolean { ... }

// ✅ null/undefined 처리
type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
```

---

## ⚡ 개발 에이전트를 위한 Quick Start

### Task R-001 시작 체크리스트

- [ ] `src/utils/repeatUtils.ts` 파일 생성
- [ ] 테스트 먼저 작성: `src/__tests__/unit/easy.repeatUtils.spec.ts`
- [ ] RED: 테스트 실패 확인
- [ ] GREEN: 최소 구현 (isValidRepeatType만)
- [ ] REFACTOR: 엣지 케이스 테스트 추가 (31일, 윤년)
- [ ] 커밋: `feat: add repeat type validation utilities`

### 실행 명령어

```bash
# 테스트 실행
pnpm test -- src/__tests__/unit/easy.repeatUtils.spec.ts

# 커버리지 확인
pnpm test:coverage -- src/utils/repeatUtils.ts

# 타입 체크
pnpm lint:tsc
```

---

## ✅ 아키텍트 에이전트 확인사항

- [x] 기존 타입 정의 확인: ✅ RepeatType, RepeatInfo 이미 있음
- [x] 파일 구조 맵핑 완료
- [x] MSW 핸들러 현황 파악
- [x] 테스트 자산 인벤토리 작성
- [x] 코드 컨벤션 정리
- [ ] 개발 에이전트가 Task R-001 시작 가능 상태 확인 → **준비 완료!**

---

## 📝 BMAD 에이전트 워크플로우 (다음 단계)

```
1. ✅ 기획 에이전트 (Spec & Signal Curator)
   └─ 반복 일정 기능 명세서 작성 완료

2. ✅ 계획 에이전트 (Work Decomposer & Planner)
   └─ 태스크 DAG & 스프린트 계획 작성 완료

3. ✅ 아키텍트 에이전트 (Repo & Context Orchestrator)
   ├─ 기존 코드 구조 분석 완료
   ├─ 관련 파일 매핑 완료
   ├─ 테스트 자산 매핑 완료
   └─ Context Brief 문서 생성 완료

4. → 개발 에이전트 (Implementation Executor)
   ├─ Task R-001 RED: 반복 타입 유틸 테스트 작성
   ├─ Task R-001 GREEN: 반복 타입 유틸 구현
   ├─ Task R-001 REFACTOR: 엣지 케이스 추가 테스트
   ├─ Task R-004 RED: 반복 아이콘 함수 테스트
   ├─ Task R-004 GREEN: 반복 아이콘 함수 구현
   └─ ... (이후 모든 Task에 대해 RED/GREEN/REFACTOR 반복)

5. → QA 에이전트 (QA & Automation Sentinel)
   ├─ 모든 테스트 파이프라인 실행 (Unit → Integration → E2E)
   ├─ 테스트 커버리지 검증 (70% 이상)
   ├─ 실패 테스트 분류 (회귀/환경/flaky)
   └─ 품질 게이트 결과 리포트

6. → 배포 에이전트 (Release & Feedback Synthesizer)
   ├─ QA 승인 후 배포 준비
   ├─ 배포 전 스모크 테스트 실행
   ├─ 배포 및 모니터링
   ├─ 사용자 피드백 수집
   └─ 피드백을 기획 에이전트(1단계)로 전달 (다음 사이클)
```

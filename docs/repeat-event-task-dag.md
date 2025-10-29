# 반복 일정 기능 - 태스크 DAG & 계획

> **작성**: 계획 에이전트 (Work Decomposer & Planner)  
> **기반**: 반복 일정 기능 명세서  
> **팀 벨로시티**: 40 story points/sprint  

---

## 📊 태스크 분해 (Task DAG)

### Phase 1: 반복 타입 선택 (Priority: P0)

```
┌─────────────────────────────────────────────────────────┐
│ TASK-R-001: 반복 타입 유틸 함수 구현                       │
│ Complexity: EASY | Est: 2h | Deps: []                    │
│ 📝 Description:                                           │
│   - RepeatType enum 정의                                  │
│   - 유효성 검증 함수 (isValidRepeatType)                   │
│   - 31일 월간 반복 규칙 함수                               │
│   - 윤년 29일 연간 반복 규칙 함수                          │
│ 🧪 Test Type: UNIT                                        │
│ 📍 Location: src/utils/repeatUtils.ts                    │
│ 🎯 Coverage: 80%+                                         │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│ TASK-R-002: RepeatEvent 타입 정의 & API 훅              │
│ Complexity: EASY | Est: 1.5h | Deps: [TASK-R-001]       │
│ 📝 Description:                                           │
│   - TypeScript interfaces 정의                            │
│   - useEventOperations 확장 (반복 저장)                   │
│   - API mock (MSW handler) 추가                           │
│ 🧪 Test Type: UNIT + INTEGRATION                         │
│ 📍 Location: src/types/*.ts, src/hooks/useEventOperations.ts │
│ 🎯 Coverage: 75%+                                         │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│ TASK-R-003: 일정 폼 UI 확장 (반복 타입 드롭다운)         │
│ Complexity: MEDIUM | Est: 3h | Deps: [TASK-R-002]       │
│ 📝 Description:                                           │
│   - EventForm에 반복 타입 select 추가                     │
│   - 옵션: 없음, 매일, 매주, 매월, 매년                    │
│   - 반복 종료 날짜 필드 추가                              │
│ 🧪 Test Type: INTEGRATION + E2E                          │
│ 📍 Location: src/components/EventForm.tsx                │
│ 🎯 Coverage: 70%+                                         │
└─────────────────────────────────────────────────────────┘
```

### Phase 2: 반복 일정 표시 (Priority: P0)

```
         ┌─────────────────────────────────────────────────────────┐
         │ TASK-R-004: 반복 아이콘 렌더 함수                        │
         │ Complexity: EASY | Est: 1.5h | Deps: []                │
         │ 📝 Description:                                          │
         │   - getRepeatIcon(repeatType) 함수                      │
         │   - 반복 상태 확인 로직                                  │
         │ 🧪 Test Type: UNIT                                      │
         │ 📍 Location: src/utils/repeatUtils.ts                  │
         │ 🎯 Coverage: 90%+                                        │
         └─────────────────────────────────────────────────────────┘
                │
                ↓
         ┌─────────────────────────────────────────────────────────┐
         │ TASK-R-005: Calendar 컴포넌트 확장 (반복 아이콘)         │
         │ Complexity: MEDIUM | Est: 2.5h | Deps: [TASK-R-004]    │
         │ 📝 Description:                                          │
         │   - Calendar에 반복 아이콘 표시 로직                     │
         │   - 아이콘 스타일 및 위치                                │
         │ 🧪 Test Type: INTEGRATION                               │
         │ 📍 Location: src/components/Calendar.tsx                │
         │ 🎯 Coverage: 75%+                                        │
         └─────────────────────────────────────────────────────────┘
```

### Phase 3: 반복 종료 & 수정/삭제 (Priority: P1)

```
         ┌─────────────────────────────────────────────────────────┐
         │ TASK-R-006: 반복 일정 생성 로직 (DB)                     │
         │ Complexity: MEDIUM | Est: 4h | Deps: [TASK-R-002]      │
         │ 📝 Description:                                          │
         │   - 반복 타입별 일정 생성 함수                           │
         │   - 반복 종료 날짜 검증                                  │
         │   - parentId 관계 설정                                   │
         │ 🧪 Test Type: UNIT                                      │
         │ 📍 Location: src/utils/repeatUtils.ts                  │
         │ 🎯 Coverage: 80%+                                        │
         └─────────────────────────────────────────────────────────┘
                │
                ├─────────────────────────────────┐
                ↓                                 ↓
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │ TASK-R-007: 단일 수정 로직 │    │ TASK-R-008: 전체 수정 로직 │
    │ Complexity: MEDIUM       │    │ Complexity: MEDIUM       │
    │ Est: 2h | Deps: [R-006]  │    │ Est: 2h | Deps: [R-006]  │
    │ 🧪 Test Type: UNIT       │    │ 🧪 Test Type: UNIT       │
    │ 📍 Location: Hooks       │    │ 📍 Location: Hooks       │
    └──────────────────────────┘    └──────────────────────────┘
                │                                 │
                ├─────────────────────────────────┤
                ↓
    ┌──────────────────────────────────────────────────────┐
    │ TASK-R-009: 반복 수정 UI (모달)                      │
    │ Complexity: MEDIUM | Est: 2.5h | Deps: [R-007,R-008]│
    │ 📝 Description:                                       │
    │   - "해당 일정만 수정?" 모달                          │
    │   - 예/아니오 선택 → 단일/전체 수정 분기             │
    │ 🧪 Test Type: E2E                                    │
    │ 📍 Location: src/components/RepeatEditModal.tsx      │
    └──────────────────────────────────────────────────────┘
                │
                ├─────────────────────────────────┐
                ↓                                 ↓
    ┌──────────────────────────┐    ┌──────────────────────────┐
    │ TASK-R-010: 단일 삭제 로직 │    │ TASK-R-011: 전체 삭제 로직 │
    │ Complexity: EASY         │    │ Complexity: EASY         │
    │ Est: 1.5h | Deps: [R-006]│    │ Est: 1.5h | Deps: [R-006]│
    │ 🧪 Test Type: UNIT       │    │ 🧪 Test Type: UNIT       │
    └──────────────────────────┘    └──────────────────────────┘
                │                                 │
                ├─────────────────────────────────┤
                ↓
    ┌──────────────────────────────────────────────────────┐
    │ TASK-R-012: 반복 삭제 UI (모달)                      │
    │ Complexity: EASY | Est: 2h | Deps: [R-010,R-011]   │
    │ 📝 Description:                                       │
    │   - "해당 일정만 삭제?" 모달                          │
    │   - 예/아니오 선택 → 단일/전체 삭제 분기             │
    │ 🧪 Test Type: E2E                                    │
    │ 📍 Location: src/components/RepeatDeleteModal.tsx    │
    └──────────────────────────────────────────────────────┘
```

---

## 🗺️ 태스크 매트릭스

| Task ID | 제목 | 복잡도 | 소요시간 | 의존성 | 병렬 가능 | 테스트 |
|---------|------|--------|---------|--------|---------|--------|
| R-001 | 반복 타입 유틸 | EASY | 2h | - | Y | Unit 70% |
| R-002 | 타입 정의 & 훅 | EASY | 1.5h | R-001 | Y | Unit/Int 75% |
| R-003 | UI 폼 확장 | MEDIUM | 3h | R-002 | N | Int/E2E 70% |
| R-004 | 아이콘 함수 | EASY | 1.5h | - | Y | Unit 90% |
| R-005 | Calendar 확장 | MEDIUM | 2.5h | R-004 | N | Int 75% |
| R-006 | 반복 생성 로직 | MEDIUM | 4h | R-002 | N | Unit 80% |
| R-007 | 단일 수정 | MEDIUM | 2h | R-006 | Y | Unit 75% |
| R-008 | 전체 수정 | MEDIUM | 2h | R-006 | Y | Unit 75% |
| R-009 | 수정 UI 모달 | MEDIUM | 2.5h | R-007,R-008 | N | E2E 70% |
| R-010 | 단일 삭제 | EASY | 1.5h | R-006 | Y | Unit 80% |
| R-011 | 전체 삭제 | EASY | 1.5h | R-006 | Y | Unit 80% |
| R-012 | 삭제 UI 모달 | EASY | 2h | R-010,R-011 | N | E2E 70% |

---

## 📅 권장 스프린트 계획

### Sprint 1 (Phase 1 + 아이콘)
**Total: 15.5h (~2일)**

**병렬 작업**:
- R-001 + R-004 (유틸 함수들) → 3.5h
- R-002 (타입 정의) → 1.5h
- R-003 (폼 UI) → 3h (R-002 완료 후)
- R-005 (Calendar) → 2.5h (R-004 완료 후)

**Critical Path**: R-001 → R-002 → R-003

### Sprint 2 (Phase 3)
**Total: 18h (~2-3일)**

**병렬 작업**:
- R-006 (생성 로직) → 4h
- R-007 + R-008 (수정 로직) → 4h (R-006 완료 후)
- R-010 + R-011 (삭제 로직) → 3h (R-006 완료 후)
- R-009 (수정 UI) → 2.5h (R-007,008 완료 후)
- R-012 (삭제 UI) → 2h (R-010,011 완료 후)

**Critical Path**: R-006 → R-007/008/010/011 → R-009/012

---

## 🎯 테스트 전략

### 전체 커버리지 목표
- **Unit Tests**: 70% of total (유틸 함수, 로직)
- **Integration Tests**: 20% (DB 저장, 훅 통합)
- **E2E Tests**: 10% (사용자 시나리오)

### 테스트 실행 순서
```
1. Unit Tests (모든 유틸, 로직) → < 30초
2. Integration Tests (훅, 폼, DB) → < 2분
3. E2E Tests (모달 선택, 전체 흐름) → < 5분
```

---

## ⚠️ 위험 관리

| 위험 | 확률 | 영향 | 대응 |
|------|------|------|-----|
| 반복 생성 성능 | High | High | 레이지 로딩 구현, DB 인덱스 추가 |
| 타입 정의 변경 | Medium | High | 초기 설계 검토 (R-002 이전) |
| 모달 UX 복잡도 | Medium | Medium | 단순 예/아니오로 제한, 명확한 텍스트 |
| 기존 코드 충돌 | Low | Medium | git branch isolation, 통합 테스트 |

---

## ✅ 완료 기준

- [ ] 모든 Task의 테스트 커버리지 70% 이상
- [ ] 엣지 케이스(31일, 윤년) 100% 테스트
- [ ] E2E 테스트 모든 시나리오 통과
- [ ] Performance: 반복 일정 1000개 생성 < 2초
- [ ] 코드 리뷰 피드백 반영 완료
- [ ] 배포 준비 완료

---

## 📝 BMAD 에이전트 워크플로우 (다음 단계)

```
1. ✅ 기획 에이전트 (Spec & Signal Curator)
   └─ 반복 일정 기능 명세서 작성 완료

2. ✅ 계획 에이전트 (Work Decomposer & Planner)
   └─ 태스크 DAG & 스프린트 계획 작성 완료

3. → 아키텍트 에이전트 (Repo & Context Orchestrator)
   ├─ 기존 코드 구조 분석 (useEventOperations, EventForm 등)
   ├─ 관련 파일 매핑 (src/utils/*, src/hooks/*, src/components/*)
   ├─ 테스트 자산 매핑 (MSW handlers, fixtures, test utilities)
   └─ Context Brief 문서 생성

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

---

## 🔄 BMAD 순환 구조

```
Spec (기획) 
   ↓
Plan (계획)
   ↓
Context (아키텍트)
   ↓
Implement (개발: RED/GREEN/REFACTOR)
   ↓
Verify (QA: 자동 테스트)
   ↓
Release & Learn (배포 & 피드백)
   ↓ (피드백 루프)
Spec (기획) ← 다시 시작

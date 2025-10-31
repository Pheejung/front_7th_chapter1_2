# 테스트 작성 가이드라인

## 개요

이 문서는 효과적인 테스트 작성을 위한 규칙과 모범 사례를 정리한 가이드입니다. TDD (Test-Driven Development) 방식으로 개발할 때 특히 중요합니다.

## 기본 원칙

### 1. FIRST 원칙

- **F**ast: 테스트는 빠르게 실행되어야 함
- **I**solated: 각 테스트는 독립적으로 실행 가능
- **R**epeatable: 언제 어디서나 같은 결과
- **S**elf-validating: 테스트 결과가 명확
- **T**imely: 프로덕션 코드 전에 작성

### 2. 테스트 피라미드

```
E2E Tests (상단, 적은 수)
  ↕️
Integration Tests (중간)
  ↕️
Unit Tests (하단, 많은 수)
```

## 테스트 유형별 작성 규칙

### 유닛 테스트 (Unit Tests)

#### 파일 구조

```
src/utils/dateUtils.ts
src/utils/dateUtils.spec.ts
```

#### AAA 패턴

```typescript
describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      // Arrange
      const date = new Date('2025-01-01');

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('2025-01-01');
    });
  });
});
```

#### 규칙

- **하나의 개념만 테스트**: 각 테스트는 하나의 기능만 검증
- **명확한 테스트명**: `it('should return true when ...')` 형식
- **독립성 보장**: 다른 테스트에 영향받지 않음
- **빠른 실행**: 외부 의존성 최소화
- **결정론적**: 항상 같은 결과

### 통합 테스트 (Integration Tests)

#### 파일 구조

```
src/__tests__/medium.integration.spec.tsx
```

#### 특징

- 여러 컴포넌트/모듈 간 상호작용 테스트
- 실제 API 호출 또는 MSW 모킹
- 사용자 시나리오 기반

#### 규칙

- **실제 사용자 플로우**: 실제 사용자가 하는 행동 시뮬레이션
- **종단간 검증**: 입력부터 출력까지 전체 흐름
- **외부 의존성 모킹**: API, 데이터베이스 등
- **상태 관리**: 컴포넌트 상태 변화 검증

### E2E 테스트 (End-to-End Tests)

#### 도구

- Playwright 또는 Cypress
- 실제 브라우저 환경

#### 규칙

- **사용자 관점**: 실제 사용자처럼 행동
- **중요 시나리오만**: 모든 경우를 커버하지 말고 핵심 기능
- **느린 실행 고려**: CI/CD에서 별도 실행
- **플래키 방지**: 안정적인 셀렉터 사용

## 테스트 작성 모범 사례

### 1. 테스트명 규칙

```typescript
// 좋음
it('should display error message when title is empty');
it('should save event when all required fields are filled');
it('should prevent overlapping events');

// 나쁨
it('test 1');
it('should work');
it('error handling');
```

### 2. 테스트 데이터 준비

```typescript
// 좋음: 명확한 의도
const validEvent = {
  title: '팀 미팅',
  date: '2025-10-15',
  startTime: '10:00',
  endTime: '11:00',
  // ...
};

// 나쁨: 매직 넘버
const event = { title: '', date: '2025-01-01', startTime: '10:00' };
```

### 3. Assertion 전략

```typescript
// 좋음: 구체적이고 의미있는 assertion
expect(screen.getByText('일정이 저장되었습니다')).toBeInTheDocument();
expect(eventList).toHaveLength(3);

// 나쁨: 너무 포괄적
expect(component).toBeDefined();
expect(result).toBeTruthy();
```

### 4. 테스트 그룹화

```typescript
describe('EventForm', () => {
  describe('validation', () => {
    it('should show error for empty title', () => { ... });
    it('should show error for invalid time', () => { ... });
  });

  describe('submission', () => {
    it('should save valid event', () => { ... });
    it('should handle API errors', () => { ... });
  });
});
```

## TDD 사이클 적용

### RED 단계

```typescript
it('should calculate next weekly date', () => {
  // 아직 구현되지 않은 기능을 테스트
  expect(getNextWeeklyDate(new Date('2025-01-01'), 1)).toEqual(new Date('2025-01-08'));
});
// 이 테스트는 실패함 (RED)
```

### GREEN 단계

```typescript
export function getNextWeeklyDate(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}
// 최소한의 코드로 테스트 통과 (GREEN)
```

### REFACTOR 단계

```typescript
export function getNextWeeklyDate(date: Date, weeks: number): Date {
  if (weeks < 0) throw new Error('Weeks must be positive');
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}
// 코드 개선 및 추가 테스트 (REFACTOR)
```

## 커버리지 목표

### 유닛 테스트

- **Statement coverage**: 80% 이상
- **Branch coverage**: 75% 이상
- **Function coverage**: 90% 이상

### 통합 테스트

- 주요 사용자 시나리오 100% 커버
- 에러 케이스 포함

### E2E 테스트

- Happy path: 필수
- 주요 에러 시나리오: 권장

## 테스트 자동화

### CI/CD 파이프라인

```yaml
# 예시 GitHub Actions
- name: Run Tests
  run: |
    pnpm test:unit
    pnpm test:integration
    pnpm test:e2e
```

### 커버리지 리포트

- PR마다 커버리지 확인
- 커버리지 감소 시 경고
- 정기적 커버리지 리뷰

## 안티 패턴 피하기

### 1. 테스트 로직 중복

```typescript
// 나쁨
it('should validate email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});
it('should reject invalid email', () => {
  expect(validateEmail('invalid')).toBe(false);
});

// 좋음
describe('validateEmail', () => {
  it('should accept valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### 2. 과도한 모킹

```typescript
// 나쁨: 모든 것을 모킹
const mockApi = jest.fn();
const mockUtils = jest.fn();
// ... 수십 개의 모킹

// 좋음: 필요한 것만 모킹
jest.mock('../api/events', () => ({
  saveEvent: jest.fn(),
}));
```

### 3. 비결정론적 테스트

```typescript
// 나쁨: 시간에 의존
it('should show current time', () => {
  expect(getCurrentTime()).toBe(new Date().toISOString());
});

// 좋음: 시간을 고정
it('should format time correctly', () => {
  vi.setSystemTime(new Date('2025-01-01 10:00:00'));
  expect(getCurrentTime()).toBe('2025-01-01T10:00:00.000Z');
});
```

## 도구별 가이드라인

### Vitest + Testing Library

- `screen`을 활용한 접근성 중심 테스트
- `userEvent`로 실제 사용자 행동 시뮬레이션
- `vi.fn()`으로 모킹

### MSW (Mock Service Worker)

- API 응답 모킹에 사용
- 실제 네트워크 요청 방지
- 테스트 격리 보장

### 테스트 더블

- **Stub**: 간단한 값 반환
- **Mock**: 호출 검증
- **Spy**: 기존 함수 감시
- **Fake**: 간단한 구현체

## 유지보수 팁

### 1. 테스트 리팩토링

- 중복 코드 제거
- 헬퍼 함수 활용
- 테스트 픽스처 사용

### 2. 테스트 디버깅

- `--reporter=verbose`로 상세 출력
- `console.log` 임시 사용 (제거 필수)
- 단계별 디버깅

### 3. 테스트 문서화

- 복잡한 테스트에 주석 추가
- 테스트 목적 명확히 설명
- 팀 내 공유

## 결론

좋은 테스트는 코드 품질을 보장하고 리팩토링을 안전하게 만듭니다. FIRST 원칙과 테스트 피라미드를 따르면 유지보수하기 쉽고 신뢰할 수 있는 테스트 스위트를 구축할 수 있습니다.

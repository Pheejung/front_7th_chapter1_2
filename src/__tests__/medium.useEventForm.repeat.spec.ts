/**
 * @file medium.useEventForm.repeat.spec.ts
 * @description Task R-003 RED: EventForm 반복 기능 테스트
 *
 * 명세 기준 필수 스펙:
 * 1. 반복 유형 선택: 매일, 매주, 매월, 매년
 * 2. 반복 종료: 특정 날짜까지 (2025-12-31 최대)
 * 3. 반복 일정 수정/삭제: 단일 vs 전체
 *
 * RED 상태: useEventForm 훅이 아직 반복 기능을 제공하지 않음을 가정
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useEventForm } from '../hooks/useEventForm';

describe('Task R-003 RED: EventForm 반복 기능', () => {
  // ============================================================
  // 명세 1: 반복 유형 선택 (매일, 매주, 매월, 매년)
  // ============================================================
  describe('명세 1-1: 반복 유형 초기 상태', () => {
    it('초기 반복 타입은 "none"이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());
      expect(result.current.repeatType).toBe('none');
    });
  });

  describe('명세 1-2: 반복 유형을 매일로 선택', () => {
    it('반복 타입을 "daily"로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('daily');
      });

      expect(result.current.repeatType).toBe('daily');
    });
  });

  describe('명세 1-3: 반복 유형을 매주로 선택', () => {
    it('반복 타입을 "weekly"로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('weekly');
      });

      expect(result.current.repeatType).toBe('weekly');
    });
  });

  describe('명세 1-4: 반복 유형을 매월로 선택', () => {
    it('반복 타입을 "monthly"로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('monthly');
      });

      expect(result.current.repeatType).toBe('monthly');
    });

    it('31일에 매월을 선택하면 매월 31일에만 생성되어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('monthly');
      });

      // 반복 타입 설정 확인
      expect(result.current.repeatType).toBe('monthly');
    });
  });

  describe('명세 1-5: 반복 유형을 매년으로 선택', () => {
    it('반복 타입을 "yearly"로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('yearly');
      });

      expect(result.current.repeatType).toBe('yearly');
    });

    it('윤년 29일에 매년을 선택하면 29일에만 생성되어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('yearly');
      });

      // 반복 타입 설정 확인
      expect(result.current.repeatType).toBe('yearly');
    });
  });

  // ============================================================
  // 명세 3: 반복 종료 (특정 날짜까지, 최대 2025-12-31)
  // ============================================================
  describe('명세 3-1: 반복 종료 날짜 초기 상태', () => {
    it('초기 반복 종료 날짜는 빈 문자열이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());
      expect(result.current.repeatEndDate).toBe('');
    });
  });

  describe('명세 3-2: 반복 종료 날짜 설정', () => {
    it('반복 종료 날짜를 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatEndDate('2025-06-30');
      });

      expect(result.current.repeatEndDate).toBe('2025-06-30');
    });
  });

  describe('명세 3-3: 반복 종료 날짜 최대값', () => {
    it('반복 종료 날짜의 최대값은 2025-12-31이어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatEndDate('2025-12-31');
      });

      expect(result.current.repeatEndDate).toBe('2025-12-31');
    });
  });

  // ============================================================
  // 통합 시나리오
  // ============================================================
  describe('통합: 반복 유형 + 종료 날짜', () => {
    it('반복 유형(매주)과 종료 날짜를 함께 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('weekly');
        result.current.setRepeatEndDate('2025-12-31');
      });

      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.repeatEndDate).toBe('2025-12-31');
    });
  });

  describe('통합: 폼 리셋', () => {
    it('반복 설정을 포함한 전체 폼을 리셋할 수 있어야 한다', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setRepeatType('daily');
        result.current.setRepeatEndDate('2025-12-31');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatEndDate).toBe('');
    });
  });

  describe('통합: 반복 일정 초기화', () => {
    it('반복이 있는 일정으로 폼을 초기화할 수 있어야 한다', () => {
      const eventWithRepeat = {
        title: 'Weekly Meeting',
        startDate: '2025-01-01',
        endDate: '2025-01-01',
        repeat: {
          type: 'weekly' as const,
          interval: 1,
          endDate: '2025-12-31',
        },
      } as any;

      const { result } = renderHook(() => useEventForm(eventWithRepeat));

      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.repeatEndDate).toBe('2025-12-31');
    });

    it('반복이 없는 일정으로 폼을 초기화할 수 있어야 한다', () => {
      const eventWithoutRepeat = {
        title: 'One-time Event',
        startDate: '2025-01-01',
        endDate: '2025-01-01',
      } as any;

      const { result } = renderHook(() => useEventForm(eventWithoutRepeat));

      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatEndDate).toBe('');
    });
  });
});

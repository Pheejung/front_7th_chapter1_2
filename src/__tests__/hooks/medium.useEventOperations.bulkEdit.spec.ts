import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { setupMockHandlerRepeatModification } from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
      closeSnackbar: vi.fn(),
    }),
  };
});

describe('반복 일정 일괄 수정 (R-008)', () => {
  it('반복 일정의 모든 이벤트를 일괄 수정할 수 있어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 1. 반복 일정 생성 (3일간 매일 반복)
    await result.current.saveEvent({
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '원본 설명',
      location: '회의실 A',
      category: '업무' as const,
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-11-03',
      },
      notificationTime: 10,
    });

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThanOrEqual(3);
    });

    // 2. 첫 번째 일정 찾기
    const firstEvent = result.current.events.find((e) => e.date === '2025-11-01');
    expect(firstEvent).toBeDefined();
    expect(firstEvent?.parentId).toBeDefined();

    const parentId = firstEvent!.parentId;

    // 3. 모든 반복 일정을 일괄 수정
    await act(async () => {
      await result.current.updateAllRecurringEvents(parentId!, {
        title: '수정된 매일 회의',
        description: '수정된 설명',
        location: '회의실 B',
        startTime: '10:00',
        endTime: '11:00',
      });
    });

    await waitFor(() => {
      const events = result.current.events;

      // 모든 반복 일정이 수정되었는지 확인
      const nov01 = events.find((e) => e.date === '2025-11-01');
      expect(nov01?.title).toBe('수정된 매일 회의');
      expect(nov01?.description).toBe('수정된 설명');
      expect(nov01?.location).toBe('회의실 B');
      expect(nov01?.startTime).toBe('10:00');
      expect(nov01?.endTime).toBe('11:00');

      const nov02 = events.find((e) => e.date === '2025-11-02');
      expect(nov02?.title).toBe('수정된 매일 회의');
      expect(nov02?.description).toBe('수정된 설명');
      expect(nov02?.location).toBe('회의실 B');

      const nov03 = events.find((e) => e.date === '2025-11-03');
      expect(nov03?.title).toBe('수정된 매일 회의');
      expect(nov03?.description).toBe('수정된 설명');
      expect(nov03?.location).toBe('회의실 B');
    });
  });

  it('일괄 수정 시 parentId와 repeat.type이 유지되어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 1. 주간 반복 일정 생성
    await result.current.saveEvent({
      title: '주간 회의',
      date: '2025-11-03',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 팀 미팅',
      location: '본사',
      category: '업무' as const,
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2025-11-17',
      },
      notificationTime: 10,
    });

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThanOrEqual(2);
    });

    const firstEvent = result.current.events.find((e) => e.date === '2025-11-03');
    const parentId = firstEvent!.parentId;
    const originalRepeatType = firstEvent!.repeat.type;

    // 2. 일괄 수정
    await act(async () => {
      await result.current.updateAllRecurringEvents(parentId!, {
        title: '수정된 주간 회의',
        location: '지사',
      });
    });

    await waitFor(() => {
      const events = result.current.events.filter((e) => e.parentId === parentId);

      events.forEach((event) => {
        // parentId 유지 확인
        expect(event.parentId).toBe(parentId);
        // repeat.type 유지 확인
        expect(event.repeat.type).toBe(originalRepeatType);
        // 수정된 내용 확인
        expect(event.title).toBe('수정된 주간 회의');
        expect(event.location).toBe('지사');
      });
    });
  });

  it('일괄 수정 시 date는 각 이벤트마다 다르게 유지되어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 1. 반복 일정 생성
    await result.current.saveEvent({
      title: '매일 운동',
      date: '2025-11-01',
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 운동',
      location: '헬스장',
      category: '개인' as const,
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-11-03',
      },
      notificationTime: 10,
    });

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThanOrEqual(3);
    });

    const firstEvent = result.current.events.find((e) => e.date === '2025-11-01');
    const parentId = firstEvent!.parentId;

    // 원본 날짜 저장
    const originalDates = result.current.events
      .filter((e) => e.parentId === parentId)
      .map((e) => e.date)
      .sort();

    // 2. 일괄 수정
    await act(async () => {
      await result.current.updateAllRecurringEvents(parentId!, {
        title: '수정된 운동',
        description: '저녁 운동',
      });
    });

    await waitFor(() => {
      const events = result.current.events.filter((e) => e.parentId === parentId);

      // 날짜는 변경되지 않아야 함
      const updatedDates = events.map((e) => e.date).sort();
      expect(updatedDates).toEqual(originalDates);

      // 내용은 수정되어야 함
      events.forEach((event) => {
        expect(event.title).toBe('수정된 운동');
        expect(event.description).toBe('저녁 운동');
      });
    });
  });
});

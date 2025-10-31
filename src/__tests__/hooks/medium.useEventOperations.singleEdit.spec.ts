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
    }),
  };
});

describe('반복 일정 단일 수정 (R-007)', () => {
  it('반복 일정 중 하나만 수정 시 해당 일정만 변경되어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 1. 반복 일정 생성 (매일, 3일간)
    const repeatEventData = {
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '원본 설명',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-11-03',
      },
      notificationTime: 10,
    };

    await result.current.saveEvent(repeatEventData);

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThanOrEqual(3);
    });

    // 2. 두 번째 일정(11/02) 찾기
    const secondEvent = result.current.events.find((e) => e.date === '2025-11-02');
    expect(secondEvent).toBeDefined();

    // 3. 두 번째 일정만 수정 (단일 수정)
    const updatedEvent = {
      ...secondEvent!,
      title: '수정된 회의',
      description: '수정된 설명',
      location: '회의실 B',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const events = result.current.events;
      
      // 11/02 일정만 수정되었는지 확인
      const modifiedEvent = events.find((e) => e.date === '2025-11-02');
      expect(modifiedEvent?.title).toBe('수정된 회의');
      expect(modifiedEvent?.description).toBe('수정된 설명');
      expect(modifiedEvent?.location).toBe('회의실 B');

      // 11/01 일정은 원본 유지
      const firstEvent = events.find((e) => e.date === '2025-11-01');
      expect(firstEvent?.title).toBe('매일 회의');
      expect(firstEvent?.description).toBe('원본 설명');
      expect(firstEvent?.location).toBe('회의실 A');

      // 11/03 일정도 원본 유지
      const thirdEvent = events.find((e) => e.date === '2025-11-03');
      expect(thirdEvent?.title).toBe('매일 회의');
      expect(thirdEvent?.description).toBe('원본 설명');
      expect(thirdEvent?.location).toBe('회의실 A');
    });
  });

  it('단일 수정 시 parentId는 유지되어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 반복 일정 생성
    await result.current.saveEvent({
      title: '주간 회의',
      date: '2025-11-03',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2025-11-17',
      },
      notificationTime: 10,
    });

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(1);
    });

    const firstEvent = result.current.events[0];
    const originalParentId = firstEvent.parentId;

    // 첫 번째 일정 수정
    const updatedEvent = {
      ...firstEvent,
      title: '수정된 주간 회의',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const modifiedEvent = result.current.events.find((e) => e.id === firstEvent.id);
      
      // parentId는 변경되지 않아야 함
      expect(modifiedEvent?.parentId).toBe(originalParentId);
      expect(modifiedEvent?.title).toBe('수정된 주간 회의');
    });
  });

  it('단일 수정 시 repeat 정보는 none으로 변경되어야 한다', async () => {
    setupMockHandlerRepeatModification();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    // 반복 일정 생성
    await result.current.saveEvent({
      title: '매일 운동',
      date: '2025-11-01',
      startTime: '07:00',
      endTime: '08:00',
      description: '',
      location: '헬스장',
      category: '개인',
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-11-05',
      },
      notificationTime: 10,
    });

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThanOrEqual(3);
    });

    const targetEvent = result.current.events.find((e) => e.date === '2025-11-03');

    // 중간 일정 수정
    const updatedEvent = {
      ...targetEvent!,
      title: '수정된 운동',
      startTime: '08:00',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const modifiedEvent = result.current.events.find(
        (e) => e.date === '2025-11-03' && e.title === '수정된 운동'
      );

      // 단일 수정된 일정은 repeat.type이 'none'이어야 함
      expect(modifiedEvent?.repeat.type).toBe('none');
    });
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import { useEventOperations } from '../../hooks/useEventOperations';
import { Event } from '../../types';

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

describe('useEventOperations - 반복 일정', () => {
  it('매일 반복 일정 저장 시 여러 개의 이벤트가 생성되어야 한다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    const repeatEventData = {
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매일 반복되는 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily' as const,
        interval: 1,
        endDate: '2025-11-05',
      },
      notificationTime: 10,
    };

    await result.current.saveEvent(repeatEventData);

    await waitFor(() => {
      // 11/1 ~ 11/5 = 5개의 이벤트가 생성되어야 함
      expect(result.current.events.length).toBeGreaterThanOrEqual(5);
    });

    // 생성된 이벤트들이 올바른 날짜를 가지는지 확인
    const events = result.current.events;
    const dates = events.map((e: Event) => e.date).sort();

    expect(dates).toContain('2025-11-01');
    expect(dates).toContain('2025-11-02');
    expect(dates).toContain('2025-11-03');
    expect(dates).toContain('2025-11-04');
    expect(dates).toContain('2025-11-05');
  });

  it('매주 반복 일정 저장 시 올바른 간격으로 이벤트가 생성되어야 한다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    const repeatEventData = {
      title: '주간 회의',
      date: '2025-11-03', // 월요일
      startTime: '14:00',
      endTime: '15:00',
      description: '매주 반복되는 회의',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'weekly' as const,
        interval: 1,
        endDate: '2025-11-24',
      },
      notificationTime: 10,
    };

    await result.current.saveEvent(repeatEventData);

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const events = result.current.events;
    const dates = events.map((e: Event) => e.date).sort();

    // 11/3, 11/10, 11/17, 11/24 (4주)
    expect(dates).toContain('2025-11-03');
    expect(dates).toContain('2025-11-10');
    expect(dates).toContain('2025-11-17');
    expect(dates).toContain('2025-11-24');
  });

  it('매월 31일 반복 시 31일이 없는 달은 건너뛰어야 한다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    const repeatEventData = {
      title: '월말 정산',
      date: '2025-01-31',
      startTime: '16:00',
      endTime: '17:00',
      description: '매월 31일',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly' as const,
        interval: 1,
        endDate: '2025-05-31',
      },
      notificationTime: 10,
    };

    await result.current.saveEvent(repeatEventData);

    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const events = result.current.events;
    const dates = events.map((e: Event) => e.date).sort();

    // 1월, 3월, 5월 31일만 생성 (2월, 4월은 31일 없음)
    expect(dates).toContain('2025-01-31');
    expect(dates).toContain('2025-03-31');
    expect(dates).toContain('2025-05-31');
    expect(dates).not.toContain('2025-02-31');
    expect(dates).not.toContain('2025-04-31');
  });

  it('반복하지 않는 일정(none)은 1개의 이벤트만 생성되어야 한다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve());

    const singleEventData = {
      title: '단일 이벤트',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '반복하지 않음',
      location: '',
      category: '개인',
      repeat: {
        type: 'none' as const,
        interval: 0,
      },
      notificationTime: 10,
    };

    await result.current.saveEvent(singleEventData);

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    expect(result.current.events[0].date).toBe('2025-11-01');
  });
});

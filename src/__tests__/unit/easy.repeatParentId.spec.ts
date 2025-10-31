import { describe, expect, it } from 'vitest';

import { Event } from '../../types';
import { generateRecurringEvents } from '../../utils/repeatUtils';

describe('반복 일정 parentId 관계', () => {
  it('반복 일정 생성 시 모든 이벤트에 동일한 parentId가 설정되어야 한다', () => {
    const baseEvent: Event = {
      id: 'event-1',
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-11-03',
      },
      notificationTime: 10,
    };

    const events = generateRecurringEvents(baseEvent);

    // 모든 이벤트가 parentId를 가져야 함
    events.forEach((event) => {
      expect(event.parentId).toBeDefined();
    });

    // 모든 이벤트의 parentId가 동일해야 함
    const parentIds = events.map((e) => e.parentId);
    const uniqueParentIds = [...new Set(parentIds)];
    expect(uniqueParentIds).toHaveLength(1);
  });

  it('반복 일정의 parentId는 원본 이벤트의 id와 동일해야 한다', () => {
    const baseEvent: Event = {
      id: 'original-event',
      title: '주간 회의',
      date: '2025-11-03',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-11-17',
      },
      notificationTime: 10,
    };

    const events = generateRecurringEvents(baseEvent);

    // 모든 이벤트의 parentId가 원본 id와 동일
    events.forEach((event) => {
      expect(event.parentId).toBe('original-event');
    });
  });

  it('반복하지 않는 일정은 parentId가 없어야 한다', () => {
    const singleEvent: Event = {
      id: 'single-event',
      title: '단일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    };

    const events = generateRecurringEvents(singleEvent);

    // 단일 이벤트
    expect(events).toHaveLength(1);
    expect(events[0].parentId).toBeUndefined();
  });

  it('각 반복 이벤트는 고유한 id를 가져야 한다', () => {
    const baseEvent: Event = {
      id: 'event-1',
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-11-05',
      },
      notificationTime: 10,
    };

    const events = generateRecurringEvents(baseEvent);

    // 모든 이벤트의 id가 고유해야 함
    const ids = events.map((e) => e.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds).toHaveLength(events.length);
  });
});

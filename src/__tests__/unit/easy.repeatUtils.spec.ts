import { describe, expect, it } from 'vitest';

import {
  generateRecurringEvents,
  getRepeatIcon,
  isLeapYear,
  isValidRepeatType,
} from '../../utils/repeatUtils';
import { Event, RepeatType } from '../../types';

describe('repeatUtils', () => {
  describe('isValidRepeatType', () => {
    it('유효한 반복 타입(daily, weekly, monthly, yearly)을 true로 반환한다', () => {
      expect(isValidRepeatType('daily')).toBe(true);
      expect(isValidRepeatType('weekly')).toBe(true);
      expect(isValidRepeatType('monthly')).toBe(true);
      expect(isValidRepeatType('yearly')).toBe(true);
      expect(isValidRepeatType('none')).toBe(true);
    });

    it('무효한 반복 타입을 false로 반환한다', () => {
      expect(isValidRepeatType('invalid')).toBe(false);
      expect(isValidRepeatType('')).toBe(false);
      expect(isValidRepeatType('DAILY')).toBe(false);
    });
  });

  describe('getRepeatIcon', () => {
    it('반복 타입별로 올바른 아이콘을 반환한다', () => {
      expect(getRepeatIcon('none')).toBe('');
      expect(getRepeatIcon('daily')).toBe('🔄');
      expect(getRepeatIcon('weekly')).toBe('🔄');
      expect(getRepeatIcon('monthly')).toBe('🔄');
      expect(getRepeatIcon('yearly')).toBe('🔄');
    });
  });

  describe('isLeapYear', () => {
    it('윤년을 올바르게 판별한다', () => {
      expect(isLeapYear(2024)).toBe(true); // 4로 나누어떨어지고 100으로 안 나누어떨어짐
      expect(isLeapYear(2000)).toBe(true); // 400으로 나누어떨어짐
      expect(isLeapYear(1600)).toBe(true);
    });

    it('평년을 올바르게 판별한다', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(1900)).toBe(false); // 100으로 나누어떨어지지만 400으로는 안 나누어떨어짐
      expect(isLeapYear(2100)).toBe(false);
    });
  });

  describe('generateRecurringEvents - daily', () => {
    const baseEvent: Event = {
      id: '1',
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-11-05' },
      notificationTime: 10,
    };

    it('매일 반복 일정을 종료일까지 생성한다', () => {
      const events = generateRecurringEvents(baseEvent);
      
      expect(events).toHaveLength(5); // 11/1 ~ 11/5
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-02');
      expect(events[2].date).toBe('2025-11-03');
      expect(events[3].date).toBe('2025-11-04');
      expect(events[4].date).toBe('2025-11-05');
    });

    it('2일 간격 반복 일정을 생성한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as RepeatType, interval: 2, endDate: '2025-11-09' },
      };
      const events = generateRecurringEvents(event);
      
      expect(events).toHaveLength(5); // 11/1, 11/3, 11/5, 11/7, 11/9
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-03');
      expect(events[2].date).toBe('2025-11-05');
    });

    it('종료일이 없으면 최대 365일까지 생성한다', () => {
      const event = {
        ...baseEvent,
        repeat: { type: 'daily' as RepeatType, interval: 1 },
      };
      const events = generateRecurringEvents(event);
      
      expect(events.length).toBeLessThanOrEqual(365);
    });
  });

  describe('generateRecurringEvents - weekly', () => {
    const baseEvent: Event = {
      id: '2',
      title: '주간 회의',
      date: '2025-11-03', // 월요일
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-24' },
      notificationTime: 10,
    };

    it('매주 반복 일정을 생성한다 (7일 간격)', () => {
      const events = generateRecurringEvents(baseEvent);
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].date).toBe('2025-11-03');
      expect(events[1].date).toBe('2025-11-10');
      expect(events[2].date).toBe('2025-11-17');
      expect(events[3].date).toBe('2025-11-24');
    });
  });

  describe('generateRecurringEvents - monthly', () => {
    it('매월 반복 일정을 생성한다', () => {
      const baseEvent: Event = {
        id: '3',
        title: '월간 보고',
        date: '2025-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2026-02-15' },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].date).toBe('2025-11-15');
      expect(events[1].date).toBe('2025-12-15');
      expect(events[2].date).toBe('2026-01-15');
      expect(events[3].date).toBe('2026-02-15');
    });

    it('31일에 매월 반복 시 31일이 없는 달은 건너뛴다', () => {
      const baseEvent: Event = {
        id: '4',
        title: '월말 정산',
        date: '2025-01-31',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-05-31' },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      // 1월 31일, 3월 31일, 5월 31일만 생성 (2월, 4월은 31일 없음)
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      expect(events[2].date).toBe('2025-05-31');
    });
  });

  describe('generateRecurringEvents - yearly', () => {
    it('매년 반복 일정을 생성한다', () => {
      const baseEvent: Event = {
        id: '5',
        title: '생일',
        date: '2025-06-15',
        startTime: '00:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'yearly', interval: 1, endDate: '2028-06-15' },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      expect(events).toHaveLength(4); // 2025, 2026, 2027, 2028
      expect(events[0].date).toBe('2025-06-15');
      expect(events[1].date).toBe('2026-06-15');
      expect(events[2].date).toBe('2027-06-15');
      expect(events[3].date).toBe('2028-06-15');
    });

    it('2월 29일 매년 반복 시 윤년에만 생성한다', () => {
      const baseEvent: Event = {
        id: '6',
        title: '윤년 기념일',
        date: '2024-02-29',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'yearly', interval: 1, endDate: '2029-02-28' },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      // 2024(윤년), 2028(윤년)에만 2월 29일 생성
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-02-29');
      expect(events[1].date).toBe('2028-02-29');
    });
  });

  describe('generateRecurringEvents - edge cases', () => {
    it('반복 타입이 none이면 원본 이벤트만 반환한다', () => {
      const baseEvent: Event = {
        id: '7',
        title: '단일 이벤트',
        date: '2025-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-11-01');
    });

    it('각 생성된 이벤트는 고유한 ID를 가진다', () => {
      const baseEvent: Event = {
        id: '8',
        title: '반복 이벤트',
        date: '2025-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-11-03' },
        notificationTime: 10,
      };

      const events = generateRecurringEvents(baseEvent);
      
      const ids = events.map((event: Event) => event.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(events.length);
    });
  });
});

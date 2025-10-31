import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getRepeatIcon } from '../../utils/repeatUtils';
import { Event } from '../../types';

describe('반복 아이콘 표시', () => {
  describe('getRepeatIcon 함수', () => {
    it('반복하지 않는 일정(none)은 빈 문자열을 반환해야 한다', () => {
      expect(getRepeatIcon('none')).toBe('');
    });

    it('매일 반복 일정은 🔄 아이콘을 반환해야 한다', () => {
      expect(getRepeatIcon('daily')).toBe('🔄');
    });

    it('매주 반복 일정은 🔄 아이콘을 반환해야 한다', () => {
      expect(getRepeatIcon('weekly')).toBe('🔄');
    });

    it('매월 반복 일정은 🔄 아이콘을 반환해야 한다', () => {
      expect(getRepeatIcon('monthly')).toBe('🔄');
    });

    it('매년 반복 일정은 🔄 아이콘을 반환해야 한다', () => {
      expect(getRepeatIcon('yearly')).toBe('🔄');
    });
  });

  describe('이벤트 타이틀과 함께 렌더링', () => {
    it('반복 일정에 아이콘이 함께 표시되어야 한다', () => {
      const RepeatEventTitle = ({ event }: { event: Event }) => {
        const icon = getRepeatIcon(event.repeat.type);
        return (
          <div data-testid="event-title">
            {icon && <span data-testid="repeat-icon">{icon}</span>}
            <span>{event.title}</span>
          </div>
        );
      };

      const repeatEvent: Event = {
        id: '1',
        title: '매일 회의',
        date: '2025-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      };

      render(<RepeatEventTitle event={repeatEvent} />);

      const titleElement = screen.getByTestId('event-title');
      const icon = within(titleElement).getByTestId('repeat-icon');

      expect(icon).toBeInTheDocument();
      expect(icon.textContent).toBe('🔄');
      expect(titleElement.textContent).toContain('매일 회의');
    });

    it('반복하지 않는 일정에는 아이콘이 표시되지 않아야 한다', () => {
      const SingleEventTitle = ({ event }: { event: Event }) => {
        const icon = getRepeatIcon(event.repeat.type);
        return (
          <div data-testid="event-title">
            {icon && <span data-testid="repeat-icon">{icon}</span>}
            <span>{event.title}</span>
          </div>
        );
      };

      const singleEvent: Event = {
        id: '2',
        title: '단일 회의',
        date: '2025-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      render(<SingleEventTitle event={singleEvent} />);

      const titleElement = screen.getByTestId('event-title');
      const icon = within(titleElement).queryByTestId('repeat-icon');

      expect(icon).not.toBeInTheDocument();
      expect(titleElement.textContent).toBe('단일 회의');
    });
  });
});

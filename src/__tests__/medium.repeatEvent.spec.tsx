import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 아직 구현되지 않은 컴포넌트와 훅들 - RED 상태로 테스트 작성

// Mock EventForm component with repeat functionality
const EventForm = ({ onSubmit, initialData }: any) => {
  throw new Error('Not implemented: EventForm with repeat functionality');
};

// Mock useEventOperations hook with repeat functionality
const useEventOperations = () => {
  throw new Error('Not implemented: useEventOperations with repeat functionality');
};

// Mock useRepeatEvents hook
const useRepeatEvents = () => {
  throw new Error('Not implemented: useRepeatEvents hook');
};

// Mock Calendar component with repeat icons
const Calendar = ({ events, onEventClick }: any) => {
  throw new Error('Not implemented: Calendar with repeat icons');
};

describe('반복 일정 - UI 통합 테스트', () => {
  describe('이벤트 폼 - 반복 일정 설정', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('반복 타입 선택 드롭다운을 렌더링해야 한다', () => {
      const mockOnSubmit = vi.fn();

      render(<EventForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('반복 타입')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: '반복 타입' })).toBeInTheDocument();
    });

    it('반복 타입 옵션들을 표시해야 한다', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} />);

      const selectElement = screen.getByRole('combobox', { name: '반복 타입' });
      await user.click(selectElement);

      expect(screen.getByRole('option', { name: '반복 없음' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
    });

    it('반복 타입이 선택되면 반복 종료일 필드를 표시해야 한다', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} />);

      const selectElement = screen.getByRole('combobox', { name: '반복 타입' });
      await user.selectOptions(selectElement, 'daily');

      expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('YYYY-MM-DD')).toBeInTheDocument();
    });

    it('반복 타입이 없음이면 반복 종료일 필드를 숨겨야 한다', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} />);

      const selectElement = screen.getByRole('combobox', { name: '반복 타입' });
      await user.selectOptions(selectElement, 'daily');
      expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();

      await user.selectOptions(selectElement, 'none');
      expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
    });

    it('should validate repeat end date is not before start date', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} initialData={{ date: '2024-01-15' }} />);

      const selectElement = screen.getByRole('combobox', { name: '반복 타입' });
      await user.selectOptions(selectElement, 'daily');

      const endDateInput = screen.getByLabelText('반복 종료일');
      await user.type(endDateInput, '2024-01-01'); // 시작일보다 빠름

      const submitButton = screen.getByRole('button', { name: '저장' });
      await user.click(submitButton);

      expect(screen.getByText('반복 종료일은 시작일 이후여야 합니다')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate repeat end date is not after 2025-12-31', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} initialData={{ date: '2024-01-15' }} />);

      const selectElement = screen.getByRole('combobox', { name: '반복 타입' });
      await user.selectOptions(selectElement, 'yearly');

      const endDateInput = screen.getByLabelText('반복 종료일');
      await user.type(endDateInput, '2026-01-01'); // 2025년 넘어감

      const submitButton = screen.getByRole('button', { name: '저장' });
      await user.click(submitButton);

      expect(screen.getByText('반복 종료일은 2025-12-31까지만 가능합니다')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with repeat data', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();

      render(<EventForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2024-01-01');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.selectOptions(screen.getByRole('combobox', { name: '반복 타입' }), 'weekly');
      await user.type(screen.getByLabelText('반복 종료일'), '2024-12-31');

      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '주간 회의',
        date: '2024-01-01',
        startTime: '14:00',
        endTime: '15:00',
        repeatType: 'weekly',
        repeatEndDate: '2024-12-31',
      });
    });
  });

  describe('useEventOperations - 반복 일정 저장', () => {
    it('should save repeat event and generate recurring instances', async () => {
      const mockSaveEvent = vi.fn().mockResolvedValue({ id: 'event-1' });
      const mockGenerateRepeatEvents = vi.fn().mockResolvedValue([
        { id: 'event-1', date: '2024-01-01', parentId: undefined },
        { id: 'event-2', date: '2024-01-08', parentId: 'event-1' },
        { id: 'event-3', date: '2024-01-15', parentId: 'event-1' },
      ]);

      // Mock the hook
      vi.mocked(useEventOperations).mockReturnValue({
        saveEvent: mockSaveEvent,
        generateRepeatEvents: mockGenerateRepeatEvents,
        loading: false,
        error: null,
      });

      const eventData = {
        title: '주간 회의',
        date: '2024-01-01',
        startTime: '14:00',
        endTime: '15:00',
        repeatType: 'weekly',
        repeatEndDate: '2024-01-15',
      };

      const { saveEvent, generateRepeatEvents } = useEventOperations();

      const result = await saveEvent(eventData);
      expect(result.id).toBe('event-1');

      const repeatEvents = await generateRepeatEvents(eventData);
      expect(repeatEvents).toHaveLength(3);
      expect(repeatEvents[0].parentId).toBeUndefined();
      expect(repeatEvents[1].parentId).toBe('event-1');
      expect(repeatEvents[2].parentId).toBe('event-1');
    });

    it('should handle monthly repeat with 31st day rule', async () => {
      const mockGenerateRepeatEvents = vi.fn().mockResolvedValue([
        { id: 'event-1', date: '2024-01-31', parentId: undefined },
        { id: 'event-2', date: '2024-03-31', parentId: 'event-1' }, // 2월 스킵
        { id: 'event-3', date: '2024-05-31', parentId: 'event-1' }, // 4월 스킵
      ]);

      vi.mocked(useEventOperations).mockReturnValue({
        generateRepeatEvents: mockGenerateRepeatEvents,
        loading: false,
        error: null,
      });

      const eventData = {
        title: '월말 정산',
        date: '2024-01-31',
        repeatType: 'monthly',
        repeatEndDate: '2024-05-31',
      };

      const { generateRepeatEvents } = useEventOperations();
      const repeatEvents = await generateRepeatEvents(eventData);

      expect(repeatEvents).toHaveLength(3);
      expect(repeatEvents.map((e) => e.date)).toEqual(['2024-01-31', '2024-03-31', '2024-05-31']);
    });

    it('should handle yearly repeat with leap year rule', async () => {
      const mockGenerateRepeatEvents = vi.fn().mockResolvedValue([
        { id: 'event-1', date: '2024-02-29', parentId: undefined },
        { id: 'event-2', date: '2028-02-29', parentId: 'event-1' }, // 다음 윤년
      ]);

      vi.mocked(useEventOperations).mockReturnValue({
        generateRepeatEvents: mockGenerateRepeatEvents,
        loading: false,
        error: null,
      });

      const eventData = {
        title: '윤년 생일',
        date: '2024-02-29',
        repeatType: 'yearly',
        repeatEndDate: '2028-12-31',
      };

      const { generateRepeatEvents } = useEventOperations();
      const repeatEvents = await generateRepeatEvents(eventData);

      expect(repeatEvents).toHaveLength(2);
      expect(repeatEvents.map((e) => e.date)).toEqual(['2024-02-29', '2028-02-29']);
    });
  });

  describe('Calendar - 반복 아이콘 표시', () => {
    it('should display repeat icon for repeated events', () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: '매일 운동',
          date: '2024-01-01',
          repeatType: 'daily',
          isRepeated: true,
        },
        {
          id: 'event-2',
          title: '일회성 미팅',
          date: '2024-01-02',
          repeatType: 'none',
          isRepeated: false,
        },
      ];

      render(<Calendar events={mockEvents} onEventClick={vi.fn()} />);

      const repeatedEvent = screen.getByText('매일 운동');
      const oneTimeEvent = screen.getByText('일회성 미팅');

      expect(repeatedEvent).toHaveTextContent('🔄'); // 반복 아이콘
      expect(oneTimeEvent).not.toHaveTextContent('🔄');
    });

    it('should show different icons for different repeat types', () => {
      const mockEvents = [
        { id: '1', title: '매일', repeatType: 'daily', isRepeated: true },
        { id: '2', title: '매주', repeatType: 'weekly', isRepeated: true },
        { id: '3', title: '매월', repeatType: 'monthly', isRepeated: true },
        { id: '4', title: '매년', repeatType: 'yearly', isRepeated: true },
      ];

      render(<Calendar events={mockEvents} onEventClick={vi.fn()} />);

      expect(screen.getByText('매일')).toHaveTextContent('🔄');
      expect(screen.getByText('매주')).toHaveTextContent('🔄');
      expect(screen.getByText('매월')).toHaveTextContent('🔄');
      expect(screen.getByText('매년')).toHaveTextContent('🔄');
    });
  });

  describe('useRepeatEvents - 반복 일정 관리', () => {
    it('should fetch repeat events grouped by parent', async () => {
      const mockEvents = [
        { id: 'parent-1', title: '회의', parentId: undefined, isRepeated: true },
        { id: 'child-1', title: '회의', parentId: 'parent-1', isRepeated: true },
        { id: 'child-2', title: '회의', parentId: 'parent-1', isRepeated: true },
      ];

      vi.mocked(useRepeatEvents).mockReturnValue({
        events: mockEvents,
        getEventsByParent: vi.fn((parentId) => mockEvents.filter((e) => e.parentId === parentId)),
        updateSingleEvent: vi.fn(),
        updateAllEvents: vi.fn(),
        deleteSingleEvent: vi.fn(),
        deleteAllEvents: vi.fn(),
        loading: false,
        error: null,
      });

      const { events, getEventsByParent } = useRepeatEvents();

      expect(events).toHaveLength(3);

      const childEvents = getEventsByParent('parent-1');
      expect(childEvents).toHaveLength(2);
      expect(childEvents.every((e) => e.parentId === 'parent-1')).toBe(true);
    });

    it('should update single repeat event', async () => {
      const mockUpdateSingle = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useRepeatEvents).mockReturnValue({
        updateSingleEvent: mockUpdateSingle,
        loading: false,
        error: null,
      });

      const { updateSingleEvent } = useRepeatEvents();

      await updateSingleEvent('event-id', { title: '수정된 제목' });

      expect(mockUpdateSingle).toHaveBeenCalledWith('event-id', { title: '수정된 제목' });
    });

    it('should update all repeat events', async () => {
      const mockUpdateAll = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useRepeatEvents).mockReturnValue({
        updateAllEvents: mockUpdateAll,
        loading: false,
        error: null,
      });

      const { updateAllEvents } = useRepeatEvents();

      await updateAllEvents('parent-id', { title: '모든 회의 수정' });

      expect(mockUpdateAll).toHaveBeenCalledWith('parent-id', { title: '모든 회의 수정' });
    });

    it('should delete single repeat event', async () => {
      const mockDeleteSingle = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useRepeatEvents).mockReturnValue({
        deleteSingleEvent: mockDeleteSingle,
        loading: false,
        error: null,
      });

      const { deleteSingleEvent } = useRepeatEvents();

      await deleteSingleEvent('event-id');

      expect(mockDeleteSingle).toHaveBeenCalledWith('event-id');
    });

    it('should delete all repeat events', async () => {
      const mockDeleteAll = vi.fn().mockResolvedValue({ success: true });

      vi.mocked(useRepeatEvents).mockReturnValue({
        deleteAllEvents: mockDeleteAll,
        loading: false,
        error: null,
      });

      const { deleteAllEvents } = useRepeatEvents();

      await deleteAllEvents('parent-id');

      expect(mockDeleteAll).toHaveBeenCalledWith('parent-id');
    });
  });
});

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import App from '../App';
import { server } from '../setupTests';

describe('반복 일정 수정 모달 (R-009)', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-11-01'));
  });

  test('반복 일정 수정 시 "이 일정만" vs "모든 반복 일정" 선택 모달이 표시된다', async () => {
    const user = userEvent.setup();

    // 매주 반복 일정 3개 생성 (parentId로 그룹화)
    const mockEvents = [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
      {
        id: '3',
        title: '주간 회의',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    render(<App />);

    // 첫 번째 반복 일정 클릭하여 수정 모드 진입
    await screen.findByText('주간 회의');
    const firstEvent = screen.getAllByText('주간 회의')[0];
    await user.click(firstEvent);

    // 일정 수정 폼이 열림
    expect(screen.getByLabelText('제목')).toHaveValue('주간 회의');

    // 제목 변경
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 주간 회의');

    // 일정 저장 버튼 클릭
    const saveButton = screen.getByRole('button', { name: /일정 (수정|추가)/ });
    await user.click(saveButton);

    // 🎯 모달이 표시되어야 함
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText(/반복 일정 수정/i)).toBeInTheDocument();
    expect(within(modal).getByText(/이 일정만 수정/i)).toBeInTheDocument();
    expect(within(modal).getByText(/모든 반복 일정 수정/i)).toBeInTheDocument();
  });

  test('"이 일정만 수정" 선택 시 해당 일정만 수정되고 repeat.type이 none으로 변경된다', async () => {
    const user = userEvent.setup();
    let updatedEvent: any = null;

    const mockEvents = [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ request }) => {
        updatedEvent = await request.json();
        return HttpResponse.json(updatedEvent);
      })
    );

    render(<App />);

    await screen.findByText('주간 회의');
    const firstEvent = screen.getAllByText('주간 회의')[0];
    await user.click(firstEvent);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '단일 수정된 회의');

    const saveButton = screen.getByRole('button', { name: /일정 (수정|추가)/ });
    await user.click(saveButton);

    // 모달에서 "이 일정만 수정" 선택
    const modal = await screen.findByRole('dialog');
    const singleEditButton = within(modal).getByRole('button', { name: /이 일정만 수정/i });
    await user.click(singleEditButton);

    // 단일 수정이 호출되었는지 확인
    expect(updatedEvent).not.toBeNull();
    expect(updatedEvent.title).toBe('단일 수정된 회의');
    expect(updatedEvent.repeat.type).toBe('none'); // 반복 타입이 none으로 변경
    expect(updatedEvent.parentId).toBe('parent-weekly-1'); // parentId는 유지
  });

  test('"모든 반복 일정 수정" 선택 시 같은 parentId를 가진 모든 일정이 수정된다', async () => {
    const user = userEvent.setup();
    const updatedEvents: any[] = [];

    const mockEvents = [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-11-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
      {
        id: '3',
        title: '주간 회의',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-11-22' },
        parentId: 'parent-weekly-1',
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ request }) => {
        const updated = await request.json();
        updatedEvents.push(updated);
        return HttpResponse.json(updated);
      })
    );

    render(<App />);

    await screen.findByText('주간 회의');
    const firstEvent = screen.getAllByText('주간 회의')[0];
    await user.click(firstEvent);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '일괄 수정된 회의');

    const saveButton = screen.getByRole('button', { name: /일정 (수정|추가)/ });
    await user.click(saveButton);

    // 모달에서 "모든 반복 일정 수정" 선택
    const modal = await screen.findByRole('dialog');
    const bulkEditButton = within(modal).getByRole('button', { name: /모든 반복 일정 수정/i });
    await user.click(bulkEditButton);

    // 모든 반복 일정이 수정되었는지 확인
    expect(updatedEvents.length).toBe(3);
    updatedEvents.forEach((event) => {
      expect(event.title).toBe('일괄 수정된 회의');
      expect(event.parentId).toBe('parent-weekly-1'); // parentId 유지
      expect(event.repeat.type).toBe('weekly'); // repeat.type 유지
    });

    // 각 일정의 날짜는 유지되어야 함
    expect(updatedEvents.find((e) => e.id === '1')?.date).toBe('2024-11-01');
    expect(updatedEvents.find((e) => e.id === '2')?.date).toBe('2024-11-08');
    expect(updatedEvents.find((e) => e.id === '3')?.date).toBe('2024-11-15');
  });
});

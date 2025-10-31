import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/repeatUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveRecurringEvents = async (eventData: Event | EventForm) => {
    const tempEvent: Event = {
      ...eventData,
      id: 'id' in eventData ? eventData.id : String(Date.now()),
    };

    const recurringEvents = generateRecurringEvents(tempEvent);

    for (const event of recurringEvents) {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to save recurring event');
      }
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      // 수정 케이스 판단:
      // 1. editing=true: 일반 수정
      // 2. editing=false이지만 id와 parentId가 있음: 반복 일정의 단일 수정
      const hasId = 'id' in eventData && eventData.id;
      const hasParentId = 'parentId' in eventData && eventData.parentId;
      const isSingleEditFromRecurring = !editing && hasId && hasParentId;
      const isUpdating = editing || isSingleEditFromRecurring;

      if (isUpdating && hasId) {
        // 수정 로직: 반복 일정의 단일 수정 시 repeat.type을 'none'으로 변경하여 독립적인 일정으로 전환
        const eventToUpdate = {
          ...eventData,
          repeat: {
            ...eventData.repeat,
            type: 'none' as const,
          },
        };

        response = await fetch(`/api/events/${eventData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventToUpdate),
        });
      } else {
        if (eventData.repeat.type !== 'none') {
          await saveRecurringEvents(eventData);
          response = { ok: true } as Response;
        } else {
          // POST 요청 시 id 제거 (서버가 생성)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, ...eventWithoutId } = eventData as Event;
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventWithoutId),
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(isUpdating ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  /**
   * 반복 일정의 모든 이벤트를 일괄 수정
   *
   * parentId가 동일한 모든 반복 일정을 찾아서 지정된 필드만 업데이트합니다.
   * 각 이벤트의 date, parentId, repeat 설정은 유지됩니다.
   *
   * @param parentId - 반복 일정 그룹 ID
   * @param updates - 수정할 필드들 (부분 업데이트)
   * @throws {Error} parentId에 해당하는 이벤트가 없을 경우
   * @example
   * updateAllRecurringEvents('parent-123', {
   *   title: '수정된 제목',
   *   location: '새 장소'
   * });
   */
  const updateAllRecurringEvents = async (parentId: string, updates: Partial<EventForm>) => {
    try {
      // 1. parentId가 같은 모든 반복 이벤트 조회
      const eventsToUpdate = events.filter((event) => event.parentId === parentId);

      if (eventsToUpdate.length === 0) {
        throw new Error('No recurring events found with this parentId');
      }

      // 2. 각 이벤트를 병렬로 업데이트
      const updatePromises = eventsToUpdate.map(async (event) => {
        // 변경되지 않아야 할 필드들을 명시적으로 유지
        const updatedEvent = {
          ...event,
          ...updates,
          date: event.date, // 각 이벤트의 날짜는 고유하게 유지
          parentId: event.parentId, // 반복 일정 그룹 관계 유지
          repeat: event.repeat, // 반복 설정 유지
        };

        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEvent),
        });

        if (!response.ok) {
          throw new Error(`Failed to update event ${event.id}`);
        }

        return response.json();
      });

      // 3. 모든 업데이트가 완료될 때까지 대기
      await Promise.all(updatePromises);
      await fetchEvents();
      enqueueSnackbar('모든 반복 일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating recurring events:', error);
      enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent, updateAllRecurringEvents };
};

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
      // editing이 true이거나, id와 parentId가 모두 있으면 수정으로 처리 (단일 수정 케이스)
      const hasId = 'id' in eventData && eventData.id;
      const hasParentId = 'parentId' in eventData && eventData.parentId;
      const isUpdating = editing || (!editing && hasId && hasParentId);

      if (isUpdating && hasId) {
        // 수정 시: 반복 일정의 단일 수정을 위해 repeat.type을 'none'으로 변경
        const eventToUpdate = {
          ...eventData,
          repeat: {
            ...eventData.repeat,
            type: 'none' as const, // 단일 일정으로 변경
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
          const { id, ...eventWithoutId } = eventData as Event;
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

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};

import { Event, RepeatType } from '../types';

const VALID_REPEAT_TYPES: readonly RepeatType[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

const MAX_RECURRING_DAYS = 365;

/**
 * 반복 타입이 유효한지 검증
 * @param type - 검증할 반복 타입
 * @returns 유효하면 true, 아니면 false
 */
export const isValidRepeatType = (type: string): boolean => {
  return VALID_REPEAT_TYPES.includes(type as RepeatType);
};

/**
 * 반복 타입에 따른 아이콘 반환
 * @param repeatType - 반복 타입
 * @returns 아이콘 문자열
 */
export const getRepeatIcon = (repeatType: RepeatType): string => {
  if (repeatType === 'none') {
    return '';
  }
  return '🔄';
};

/**
 * 윤년 판별
 * @param year - 연도
 * @returns 윤년이면 true, 평년이면 false
 */
export const isLeapYear = (year: number): boolean => {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
};

/**
 * 특정 월의 마지막 날짜 반환
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 해당 월의 마지막 날짜
 */
const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 포맷
 * @param date - Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 반복 일정 생성
 * @param baseEvent - 기준 이벤트
 * @returns 생성된 반복 일정 배열
 */
export const generateRecurringEvents = (baseEvent: Event): Event[] => {
  const { repeat, date: startDateStr } = baseEvent;

  // 반복하지 않는 경우 원본만 반환
  if (repeat.type === 'none') {
    return [baseEvent];
  }

  const events: Event[] = [];
  const startDate = new Date(startDateStr);
  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth();

  // 종료 날짜 설정 (없으면 최대 365일)
  const endDate = repeat.endDate
    ? new Date(repeat.endDate)
    : new Date(startDate.getTime() + MAX_RECURRING_DAYS * 24 * 60 * 60 * 1000);

  let currentDate = new Date(startDate);
  let eventIndex = 0;

  // 무한 루프 방지를 위한 최대 반복 횟수
  const maxIterations = 1000;
  let iterations = 0;

  while (currentDate <= endDate && iterations < maxIterations) {
    iterations++;
    let shouldAdd = false;

    switch (repeat.type) {
      case 'daily':
        shouldAdd = true;
        break;

      case 'weekly':
        shouldAdd = true;
        break;

      case 'monthly': {
        const currentDay = currentDate.getDate();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const lastDay = getLastDayOfMonth(currentYear, currentMonth);

        // 원래 시작일이 해당 월의 마지막 날보다 큰 경우, 해당 월에 그 날짜가 있을 때만 추가
        if (startDay > lastDay) {
          shouldAdd = false;
        } else {
          shouldAdd = currentDay === startDay;
        }
        break;
      }

      case 'yearly': {
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        const currentYear = currentDate.getFullYear();

        // 2월 29일 윤년 처리
        if (startMonth === 1 && startDay === 29) {
          shouldAdd = isLeapYear(currentYear) && currentMonth === 1 && currentDay === 29;
        } else {
          shouldAdd = currentMonth === startMonth && currentDay === startDay;
        }
        break;
      }
    }

    if (shouldAdd) {
      const newEvent: Event = {
        ...baseEvent,
        id: `${baseEvent.id}-repeat-${eventIndex}`,
        date: formatDate(currentDate),
      };
      events.push(newEvent);
      eventIndex++;
    }

    // 다음 날짜로 이동
    switch (repeat.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + repeat.interval);
        break;

      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7 * repeat.interval);
        break;

      case 'monthly': {
        // 월 이동 시 날짜가 자동 조정되는 것을 방지
        const targetMonth = currentDate.getMonth() + repeat.interval;
        const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
        const newMonth = targetMonth % 12;

        // 해당 월에 startDay가 존재하는지 확인
        const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, newMonth + 1);
        const actualDay = Math.min(startDay, lastDayOfTargetMonth);

        currentDate = new Date(targetYear, newMonth, actualDay);
        break;
      }

      case 'yearly':
        // 연도만 변경하고 월/일은 유지
        currentDate = new Date(currentDate.getFullYear() + repeat.interval, startMonth, startDay);
        break;
    }
  }

  return events;
};

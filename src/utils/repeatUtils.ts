import { Event, RepeatType } from '../types';

const VALID_REPEAT_TYPES: readonly RepeatType[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'yearly',
] as const;

const MAX_RECURRING_DAYS = 365;
const MAX_ITERATIONS = 1000; // 무한 루프 방지
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

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
 * 현재 날짜가 반복 조건을 만족하는지 확인
 * @param currentDate - 확인할 현재 날짜
 * @param startDay - 시작 날짜의 일(day)
 * @param startMonth - 시작 날짜의 월(month, 0-based)
 * @param repeatType - 반복 타입
 * @returns 반복 조건을 만족하면 true
 */
const shouldAddEvent = (
  currentDate: Date,
  startDay: number,
  startMonth: number,
  repeatType: RepeatType
): boolean => {
  switch (repeatType) {
    case 'daily':
    case 'weekly':
      return true;

    case 'monthly': {
      const currentDay = currentDate.getDate();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const lastDayOfCurrentMonth = getLastDayOfMonth(currentYear, currentMonth);

      // 시작일이 해당 월의 마지막 날보다 크면 건너뛰기 (예: 31일이 없는 달)
      if (startDay > lastDayOfCurrentMonth) {
        return false;
      }
      return currentDay === startDay;
    }

    case 'yearly': {
      const currentMonth = currentDate.getMonth();
      const currentDay = currentDate.getDate();
      const currentYear = currentDate.getFullYear();

      // 2월 29일은 윤년에만 생성
      if (startMonth === 1 && startDay === 29) {
        return isLeapYear(currentYear) && currentMonth === 1 && currentDay === 29;
      }
      return currentMonth === startMonth && currentDay === startDay;
    }

    default:
      return false;
  }
};

/**
 * 다음 반복 날짜 계산
 * @param currentDate - 현재 날짜
 * @param startDay - 시작 날짜의 일(day)
 * @param startMonth - 시작 날짜의 월(month, 0-based)
 * @param repeatType - 반복 타입
 * @param interval - 반복 간격
 * @returns 다음 반복 날짜
 */
const getNextOccurrence = (
  currentDate: Date,
  startDay: number,
  startMonth: number,
  repeatType: RepeatType,
  interval: number
): Date => {
  switch (repeatType) {
    case 'daily': {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + interval);
      return next;
    }

    case 'weekly': {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7 * interval);
      return next;
    }

    case 'monthly': {
      const targetMonth = currentDate.getMonth() + interval;
      const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
      const newMonth = targetMonth % 12;

      // 해당 월에 startDay가 존재하는지 확인하여 날짜 조정
      const lastDayOfTargetMonth = getLastDayOfMonth(targetYear, newMonth + 1);
      const actualDay = Math.min(startDay, lastDayOfTargetMonth);

      return new Date(targetYear, newMonth, actualDay);
    }

    case 'yearly': {
      const nextYear = currentDate.getFullYear() + interval;
      return new Date(nextYear, startMonth, startDay);
    }

    default:
      return new Date(currentDate);
  }
};

/**
 * 반복 일정 생성
 * - 매일/매주/매월/매년 반복 일정을 생성합니다
 * - 31일이 없는 달은 자동으로 건너뜁니다
 * - 2월 29일 연간 반복은 윤년에만 생성됩니다
 *
 * @param baseEvent - 기준 이벤트
 * @returns 생성된 반복 일정 배열
 *
 * @example
 * // 매일 반복 (5일간)
 * generateRecurringEvents({
 *   ...event,
 *   repeat: { type: 'daily', interval: 1, endDate: '2025-11-05' }
 * })
 *
 * @example
 * // 매월 31일 반복 (31일이 없는 달은 건너뜀)
 * generateRecurringEvents({
 *   ...event,
 *   date: '2025-01-31',
 *   repeat: { type: 'monthly', interval: 1, endDate: '2025-05-31' }
 * })
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
    : new Date(startDate.getTime() + MAX_RECURRING_DAYS * MILLISECONDS_PER_DAY);

  let currentDate = new Date(startDate);
  let eventIndex = 0;
  let iterations = 0;

  while (currentDate <= endDate && iterations < MAX_ITERATIONS) {
    iterations++;

    if (shouldAddEvent(currentDate, startDay, startMonth, repeat.type)) {
      events.push({
        ...baseEvent,
        id: `${baseEvent.id}-repeat-${eventIndex}`,
        date: formatDate(currentDate),
      });
      eventIndex++;
    }

    // 다음 반복 날짜로 이동
    currentDate = getNextOccurrence(
      currentDate,
      startDay,
      startMonth,
      repeat.type,
      repeat.interval
    );
  }

  return events;
};

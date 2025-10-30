/**
 * 반복 일정 유틸리티 함수
 * Task R-001: 반복 타입 검증 및 반복 일정 생성 로직
 */

import { RepeatType } from '../types';

// 상수
const VALID_REPEAT_TYPES: RepeatType[] = ['daily', 'weekly', 'monthly', 'yearly', 'none'];
const MINUTES_PER_HOUR = 60;
const WEEKS_PER_ITERATION = 7;
const MONTHS_PER_YEAR = 12;
const FEBRUARY_MONTH = 1;
const LEAP_DAY_DATE = 29;

// 유틸리티
/**
 * 날짜의 시간/분/초를 초기화 (자정으로 설정)
 */
const normalizeDateToMidnight = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * 시간:분 형식의 문자열을 분 단위로 변환
 */
const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/**
 * 반복 타입이 유효한지 검증
 * @param type - 검증할 반복 타입
 * @returns 유효하면 true, 아니면 false
 * @example
 * isValidRepeatType('daily') // true
 * isValidRepeatType('invalid') // false
 */
export const isValidRepeatType = (_type: unknown): _type is RepeatType => {
  return typeof _type === 'string' && VALID_REPEAT_TYPES.includes(_type as RepeatType);
};

/**
 * 일일 반복 일정 날짜 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 1년까지)
 * @param interval - 반복 간격 (기본값: 1, N일마다 반복)
 * @returns 생성된 반복 날짜 배열
 * @throws 없음 (시작 > 종료이면 빈 배열 반환)
 * @example
 * getDailyRepeatDates(new Date('2025-01-01'), new Date('2025-01-05'))
 * // [2025-01-01, 2025-01-02, 2025-01-03, 2025-01-04, 2025-01-05]
 * @example
 * getDailyRepeatDates(new Date('2025-01-01'), new Date('2025-01-10'), 2)
 * // [2025-01-01, 2025-01-03, 2025-01-05, 2025-01-07, 2025-01-09]
 */
export const getDailyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(_endDate || _startDate);

  if (startDate > endDate) {
    return [];
  }

  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + _interval);
  }

  return dates;
};

/**
 * 주간 반복 일정 날짜 생성
 * 시작 날짜의 요일과 같은 요일마다 반복
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 1년까지)
 * @param interval - 반복 간격 (기본값: 1, N주마다 반복)
 * @returns 생성된 반복 날짜 배열 (모두 같은 요일)
 * @throws 없음 (시작 > 종료이면 빈 배열 반환)
 * @example
 * // 2025-01-06은 월요일, 2주마다 반복
 * getWeeklyRepeatDates(new Date('2025-01-06'), new Date('2025-02-03'), 2)
 * // [2025-01-06, 2025-01-20, 2025-02-03]
 */
export const getWeeklyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(_endDate || _startDate);

  if (startDate > endDate) {
    return [];
  }

  const targetDayOfWeek = startDate.getDay();
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetDayOfWeek) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + WEEKS_PER_ITERATION * _interval);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
};

/**
 * 윤년 여부 판정 (그레고리력 규칙)
 * - 400의 배수: 윤년
 * - 100의 배수: 평년
 * - 4의 배수: 윤년
 * - 그 외: 평년
 * @param year - 검증할 연도
 * @returns 윤년이면 true, 아니면 false
 * @example
 * isLeapYear(2000) // true (400의 배수)
 * isLeapYear(1900) // false (100의 배수이지만 400의 배수 아님)
 * isLeapYear(2024) // true (4의 배수)
 * isLeapYear(2025) // false (4의 배수 아님)
 */
export const isLeapYear = (_year: number): boolean => {
  return _year % 400 === 0 || (_year % 4 === 0 && _year % 100 !== 0);
};

/**
 * 월간 반복 일정 날짜 생성
 * - 31일 반복: 31일이 없는 달(2, 4, 6, 9, 11)은 건너뜀
 * - 30일 반복: 30일이 없는 달(2)은 건너뜀
 * @param startDate - 시작 날짜 (날짜가 반복 기준)
 * @param endDate - 종료 날짜 (undefined면 시작 날짜 연도의 12월까지)
 * @param interval - 반복 간격 (기본값: 1, N개월마다 반복)
 * @returns 생성된 반복 날짜 배열
 * @throws 없음 (시작 > 종료이면 빈 배열 반환)
 * @example
 * // 31일 반복: 2025년 1월 31일부터 12월까지
 * getMonthlyRepeatDates(new Date('2025-01-31'), new Date('2025-12-31'))
 * // [2025-01-31, 2025-03-31, 2025-05-31, 2025-07-31, 2025-08-31, 2025-10-31, 2025-12-31]
 * @example
 * // 30일 반복 with 간격 3: 1월, 4월, 7월, 10월
 * getMonthlyRepeatDates(new Date('2025-01-30'), new Date('2025-12-31'), 3)
 * // [2025-01-30, 2025-04-30, 2025-07-30, 2025-10-30]
 */
export const getMonthlyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(_endDate || _startDate);

  if (startDate > endDate) {
    return [];
  }

  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();
  let currentMonth = startDate.getMonth();

  let current = new Date(currentYear, currentMonth, targetDay);
  current = normalizeDateToMidnight(current);

  while (current <= endDate) {
    // 현재 날짜가 유효한지 확인 (해당 달에 그 날이 존재하는지)
    if (current.getDate() === targetDay && current >= startDate) {
      dates.push(new Date(current));
    }

    // 다음 반복 달로 이동
    currentMonth += _interval;
    if (currentMonth > 11) {
      currentYear += Math.floor(currentMonth / MONTHS_PER_YEAR);
      currentMonth = currentMonth % MONTHS_PER_YEAR;
    }

    current = new Date(currentYear, currentMonth, targetDay);
    current = normalizeDateToMidnight(current);
  }

  return dates;
};

/**
 * 연간 반복 일정 날짜 생성
 * - 2월 29일: 윤년에만 생성 (평년에는 건너뜀)
 * - 다른 날짜: 매년 같은 날짜에 생성
 * @param startDate - 시작 날짜 (월일이 반복 기준)
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 100년까지)
 * @param interval - 반복 간격 (기본값: 1, N년마다 반복)
 * @returns 생성된 반복 날짜 배열
 * @throws 없음 (시작 > 종료이면 빈 배열 반환)
 * @example
 * // 일반 날짜: 매년 1월 15일
 * getYearlyRepeatDates(new Date('2024-01-15'), new Date('2026-12-31'))
 * // [2024-01-15, 2025-01-15, 2026-01-15]
 * @example
 * // 윤년 29일: 윤년(2020, 2024, 2028)에만 생성
 * getYearlyRepeatDates(new Date('2020-02-29'), new Date('2030-12-31'))
 * // [2020-02-29, 2024-02-29, 2028-02-29]
 * @example
 * // 간격 2: 2년마다
 * getYearlyRepeatDates(new Date('2024-01-15'), new Date('2030-12-31'), 2)
 * // [2024-01-15, 2026-01-15, 2028-01-15, 2030-01-15]
 */
export const getYearlyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(_endDate || _startDate);

  if (startDate > endDate) {
    return [];
  }

  const targetMonth = startDate.getMonth();
  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();

  while (true) {
    // 2월 29일 특수 처리: 윤년이 아니면 건너뛰기
    if (targetMonth === FEBRUARY_MONTH && targetDay === LEAP_DAY_DATE) {
      if (!isLeapYear(currentYear)) {
        currentYear += _interval;
        if (new Date(currentYear, targetMonth, 1) > endDate) break;
        continue;
      }
    }

    const current = normalizeDateToMidnight(new Date(currentYear, targetMonth, targetDay));

    if (current > endDate) break;

    if (current >= startDate) {
      dates.push(new Date(current));
    }

    currentYear += _interval;
  }

  return dates;
};

interface ExistingEvent {
  date: string;
  startTime: string;
  endTime: string;
}

/**
 * 반복 일정이 기존 일정과 겹치는지 확인
 */
const isOverlapWithEvent = (repeatDate: Date, event: ExistingEvent): boolean => {
  const repeatDateString = repeatDate.toISOString().split('T')[0];

  // 날짜가 다르면 겹치지 않음
  if (event.date !== repeatDateString) {
    return false;
  }

  const repeatHour = repeatDate.getHours();
  const repeatMinute = repeatDate.getMinutes();

  // 시간이 명시되지 않은 경우 (00:00:00): 전체 날짜를 겹침으로 처리
  if (repeatHour === 0 && repeatMinute === 0) {
    return true;
  }

  // 시간이 겹치는지 확인
  const eventStartMinutes = timeStringToMinutes(event.startTime);
  const eventEndMinutes = timeStringToMinutes(event.endTime);
  const repeatMinutes = repeatHour * MINUTES_PER_HOUR + repeatMinute;

  // 반복 일정이 기존 일정의 시간 범위 내에 있는지 확인
  // endTime은 exclusive (포함하지 않음)
  return repeatMinutes >= eventStartMinutes && repeatMinutes < eventEndMinutes;
};

/**
 * 반복 일정 중에서 기존 일정과 겹치는 날짜를 제거
 * 반복일정은 일정 겹침을 고려하지 않으므로, 겹치는 일정은 필터링하여 제거
 * @param repeatDates - 반복으로 생성된 날짜 배열
 * @param existingEvents - 기존 일정 배열
 * @returns 겹치는 일정을 제거한 날짜 배열
 * @throws 없음 (빈 배열 입력하면 빈 배열 반환)
 * @example
 * // 기존 일정과 겹치지 않는 날짜만 유지
 * filterOutOverlappingDates(
 *   [new Date('2024-01-15'), new Date('2024-01-16')],
 *   [{startTime: '09:00', endTime: '10:00'}]
 * )
 * // [2024-01-16] (2024-01-15 09:00-10:00과 겹침)
 * @example
 * // 겹치는 일정이 없으면 모든 날짜 유지
 * filterOutOverlappingDates(
 *   [new Date('2024-01-15'), new Date('2024-01-16')],
 *   [{startTime: '14:00', endTime: '15:00'}]
 * )
 * // [2024-01-15, 2024-01-16] (자정 시간이라 겹침 없음)
 */
export const filterOutOverlappingDates = (
  _repeatDates: Date[],
  _existingEvents: ExistingEvent[]
): Date[] => {
  if (_repeatDates.length === 0) {
    return [];
  }

  return _repeatDates.filter(
    (repeatDate) => !_existingEvents.some((event) => isOverlapWithEvent(repeatDate, event))
  );
};

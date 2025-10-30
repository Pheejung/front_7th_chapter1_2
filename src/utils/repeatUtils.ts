/**
 * 반복 일정 유틸리티 함수
 * Task R-001: 반복 타입 검증 및 반복 일정 생성 로직
 */

import type { RepeatType, RepeatInfo } from '../types';

// ───────────────────────────────────────────────────────────────────────────────
// 상수
// ───────────────────────────────────────────────────────────────────────────────
const VALID_REPEAT_TYPES: RepeatType[] = ['daily', 'weekly', 'monthly', 'yearly', 'none'];
const MINUTES_PER_HOUR = 60;
const WEEKS_PER_ITERATION = 7;
const MONTHS_PER_YEAR = 12;
const FEBRUARY_MONTH = 1; // 0=Jan, 1=Feb
const LEAP_DAY_DATE = 29;

// 아이콘 매핑(타입 안전)
const ICONS = {
  daily: '📅',
  weekly: '🔄',
  monthly: '📆',
  yearly: '🗓️',
  none: '',
} as const satisfies Record<RepeatType, string>;

// ───────────────────────────────────────────────────────────────────────────────
// 유틸리티
// ───────────────────────────────────────────────────────────────────────────────

/** 날짜의 시간/분/초를 00:00:00.000으로 초기화 */
const normalizeDateToMidnight = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/** "HH:mm" → 분 단위로 변환 */
const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
};

/**
 * 반복 타입이 유효한지 검증
 * @returns 유효하면 true, 아니면 false
 */
export const isValidRepeatType = (_type: unknown): _type is RepeatType => {
  return typeof _type === 'string' && VALID_REPEAT_TYPES.includes(_type as RepeatType);
};

/** 윤년 여부 (그레고리력) */
export const isLeapYear = (_year: number): boolean => {
  return _year % 400 === 0 || (_year % 4 === 0 && _year % 100 !== 0);
};

// ───────────────────────────────────────────────────────────────────────────────
// 반복 일정 생성
// ───────────────────────────────────────────────────────────────────────────────

/**
 * 일일 반복 일정 날짜 생성
 * - 기본 종료일: startDate 기준 +1년
 */
export const getDailyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(
    _endDate ?? new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1))
  );

  if (startDate > endDate) return [];

  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + _interval);
  }
  return dates;
};

/**
 * 주간 반복 일정 날짜 생성 (시작 요일 기준)
 * - 기본 종료일: startDate 기준 +1년
 */
export const getWeeklyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const endDate = normalizeDateToMidnight(
    _endDate ?? new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 1))
  );

  if (startDate > endDate) return [];

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
 * 월간 반복 일정 날짜 생성
 * - 31일: 31일 없는 달은 건너뜀
 * - 30일: 30일 없는 달(2월)은 건너뜀
 * - 기본 종료일: 해당 연도 12월 31일
 */
export const getMonthlyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const defaultEnd = new Date(startDate.getFullYear(), 11, 31); // 같은 해 12/31
  const endDate = normalizeDateToMidnight(_endDate ?? defaultEnd);

  if (startDate > endDate) return [];

  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();
  let currentMonth = startDate.getMonth();

  let current = normalizeDateToMidnight(new Date(currentYear, currentMonth, targetDay));

  while (current <= endDate) {
    if (current.getDate() === targetDay && current >= startDate) {
      dates.push(new Date(current));
    }
    currentMonth += _interval;
    if (currentMonth > 11) {
      currentYear += Math.floor(currentMonth / MONTHS_PER_YEAR);
      currentMonth = currentMonth % MONTHS_PER_YEAR;
    }
    current = normalizeDateToMidnight(new Date(currentYear, currentMonth, targetDay));
  }
  return dates;
};

/**
 * 연간 반복 일정 날짜 생성
 * - 2/29: 윤년에만 생성
 * - 기본 종료일: startDate 기준 +100년
 */
export const getYearlyRepeatDates = (
  _startDate: Date,
  _endDate?: Date,
  _interval: number = 1
): Date[] => {
  const startDate = normalizeDateToMidnight(_startDate);
  const defaultEnd = new Date(new Date(startDate).setFullYear(startDate.getFullYear() + 100));
  const endDate = normalizeDateToMidnight(_endDate ?? defaultEnd);

  if (startDate > endDate) return [];

  const targetMonth = startDate.getMonth();
  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();

  while (true) {
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

// ───────────────────────────────────────────────────────────────────────────────
// 겹침 제거
// ───────────────────────────────────────────────────────────────────────────────

interface ExistingEvent {
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

/** 반복 일정이 기존 일정과 겹치는지 확인 */
const isOverlapWithEvent = (repeatDate: Date, event: ExistingEvent): boolean => {
  const repeatDateString = repeatDate.toISOString().split('T')[0];

  // 날짜가 다르면 겹치지 않음
  if (event.date !== repeatDateString) return false;

  const repeatHour = repeatDate.getHours();
  const repeatMinute = repeatDate.getMinutes();

  // 시간이 00:00인 경우: 당일 전체와 겹치는 것으로 간주(정책)
  if (repeatHour === 0 && repeatMinute === 0) return true;

  const eventStartMinutes = timeStringToMinutes(event.startTime);
  const eventEndMinutes = timeStringToMinutes(event.endTime);
  const repeatMinutes = repeatHour * MINUTES_PER_HOUR + repeatMinute;

  // endTime은 exclusive
  return repeatMinutes >= eventStartMinutes && repeatMinutes < eventEndMinutes;
};

/**
 * 반복 일정 중 기존 일정과 겹치는 날짜 제거
 */
export const filterOutOverlappingDates = (
  _repeatDates: Date[],
  _existingEvents: ExistingEvent[]
): Date[] => {
  if (_repeatDates.length === 0) return [];
  return _repeatDates.filter(
    (repeatDate) => !_existingEvents.some((event) => isOverlapWithEvent(repeatDate, event))
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// 검증 & 아이콘
// ───────────────────────────────────────────────────────────────────────────────

/**
 * 반복 정보 검증
 * - interval: 1 이상의 정수
 * - endDate가 있으면 startDate 이상
 */
export const validateRepeatInfo = (repeatInfo: RepeatInfo, startDate: string): void => {
  if (!Number.isInteger(repeatInfo.interval) || repeatInfo.interval < 1) {
    throw new Error('Interval must be a positive integer');
  }
  if (repeatInfo.endDate) {
    const s = new Date(startDate);
    const e = new Date(repeatInfo.endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      throw new Error('Invalid date format');
    }
    if (e < s) {
      throw new Error('End date must be after or equal to start date');
    }
  }
};

/**
 * 반복 타입에 따른 아이콘 반환 (타입 안전)
 */
export const getRepeatIcon = (repeatType: RepeatType): string => ICONS[repeatType];

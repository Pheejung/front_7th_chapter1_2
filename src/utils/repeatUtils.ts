/**
 * 반복 일정 유틸리티 함수
 * Task R-001: 반복 타입 검증 및 반복 일정 생성 로직
 */

import { RepeatType } from '../types';

/**
 * 반복 타입이 유효한지 검증
 * @param type - 검증할 반복 타입
 * @returns 유효하면 true, 아니면 false
 */
export const isValidRepeatType = (_type: unknown): _type is RepeatType => {
  const validTypes: RepeatType[] = ['daily', 'weekly', 'monthly', 'yearly', 'none'];
  return typeof _type === 'string' && validTypes.includes(_type as RepeatType);
};

/**
 * 일일 반복 일정 날짜 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 1년까지)
 * @param interval - 반복 간격 (기본값: 1, N일마다 반복)
 * @returns 생성된 반복 날짜 배열
 */
export const getDailyRepeatDates = (_startDate: Date, _endDate?: Date, _interval: number = 1): Date[] => {
  const startDate = new Date(_startDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = _endDate ? new Date(_endDate) : new Date(_startDate);
  endDate.setHours(0, 0, 0, 0);

  // 시작 > 종료이면 빈 배열 반환
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
 * @returns 생성된 반복 날짜 배열
 */
export const getWeeklyRepeatDates = (_startDate: Date, _endDate?: Date, _interval: number = 1): Date[] => {
  const startDate = new Date(_startDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = _endDate ? new Date(_endDate) : new Date(_startDate);
  endDate.setHours(0, 0, 0, 0);

  // 시작 > 종료이면 빈 배열 반환
  if (startDate > endDate) {
    return [];
  }

  const targetDayOfWeek = startDate.getDay();
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetDayOfWeek) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7 * _interval);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
};

/**
 * 윤년 여부 판정
 * @param year - 검증할 연도
 * @returns 윤년이면 true, 아니면 false
 */
export const isLeapYear = (_year: number): boolean => {
  // 400의 배수: 윤년
  if (_year % 400 === 0) return true;
  // 100의 배수: 평년
  if (_year % 100 === 0) return false;
  // 4의 배수: 윤년
  if (_year % 4 === 0) return true;
  // 그 외: 평년
  return false;
};

/**
 * 월간 반복 일정 날짜 생성
 * 31일 반복 시 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뜀
 * 30일 반복 시 30일이 없는 달(2월)은 건너뜀
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜 연도의 12월까지)
 * @param interval - 반복 간격 (기본값: 1, N개월마다 반복)
 * @returns 생성된 반복 날짜 배열
 */
export const getMonthlyRepeatDates = (_startDate: Date, _endDate?: Date, _interval: number = 1): Date[] => {
  const startDate = new Date(_startDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = _endDate ? new Date(_endDate) : new Date(_startDate);
  endDate.setHours(0, 0, 0, 0);

  // 시작 > 종료이면 빈 배열 반환
  if (startDate > endDate) {
    return [];
  }

  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();
  let currentMonth = startDate.getMonth();

  // 시작 날짜 체크
  let current = new Date(currentYear, currentMonth, targetDay);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    // 현재 날짜가 유효한지 확인 (해당 달에 그 날이 존재하는지)
    if (current.getDate() === targetDay) {
      if (current >= startDate) {
        dates.push(new Date(current));
      }
    }

    // 다음 반복 달로 이동
    currentMonth += _interval;
    if (currentMonth > 11) {
      currentYear += Math.floor(currentMonth / 12);
      currentMonth = currentMonth % 12;
    }

    current = new Date(currentYear, currentMonth, targetDay);
    current.setHours(0, 0, 0, 0);
  }

  return dates;
};

/**
 * 연간 반복 일정 날짜 생성
 * 2월 29일의 경우 윤년에만 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 100년까지)
 * @param interval - 반복 간격 (기본값: 1, N년마다 반복)
 * @returns 생성된 반복 날짜 배열
 */
export const getYearlyRepeatDates = (_startDate: Date, _endDate?: Date, _interval: number = 1): Date[] => {
  const startDate = new Date(_startDate);
  startDate.setHours(0, 0, 0, 0);

  let endDate = _endDate ? new Date(_endDate) : new Date(_startDate);
  endDate.setHours(0, 0, 0, 0);

  // 시작 > 종료이면 빈 배열 반환
  if (startDate > endDate) {
    return [];
  }

  const targetMonth = startDate.getMonth();
  const targetDay = startDate.getDate();
  const dates: Date[] = [];
  let currentYear = startDate.getFullYear();

  while (true) {
    let current: Date;

    // 2월 29일 특수 처리
    if (targetMonth === 1 && targetDay === 29) {
      // 윤년이 아니면 건너뛰기
      if (!isLeapYear(currentYear)) {
        currentYear += _interval;
        if (new Date(currentYear, targetMonth, 1) > endDate) break;
        continue;
      }
    }

    current = new Date(currentYear, targetMonth, targetDay);
    current.setHours(0, 0, 0, 0);

    if (current > endDate) break;

    if (current >= startDate) {
      dates.push(new Date(current));
    }

    currentYear += _interval;
  }

  return dates;
};

/**
 * 반복 일정 중에서 기존 일정과 겹치는 날짜를 제거
 * 반복일정은 일정 겹침을 고려하지 않으므로, 겹치는 일정은 필터링하여 제거
 * @param repeatDates - 반복으로 생성된 날짜 배열
 * @param existingEvents - 기존 일정 배열
 * @returns 겹치는 일정을 제거한 날짜 배열
 */
export const filterOutOverlappingDates = (
  _repeatDates: Date[],
  _existingEvents: any[]
): Date[] => {
  if (_repeatDates.length === 0) {
    return [];
  }

  return _repeatDates.filter((repeatDate) => {
    const repeatDateString = repeatDate.toISOString().split('T')[0];
    const repeatHour = repeatDate.getHours();
    const repeatMinute = repeatDate.getMinutes();

    // 이 반복 날짜와 겹치는 기존 일정이 있는지 확인
    return !_existingEvents.some((event) => {
      // 날짜가 같은지 확인
      if (event.date !== repeatDateString) {
        return false;
      }

      // 시간이 명시되지 않은 경우 (00:00:00), 전체 날짜를 겹침으로 처리
      if (repeatHour === 0 && repeatMinute === 0) {
        return true;
      }

      // 시간이 겹치는지 확인
      const [eventStartHour, eventStartMinute] = event.startTime.split(':').map(Number);
      const [eventEndHour, eventEndMinute] = event.endTime.split(':').map(Number);

      const eventStartMinutes = eventStartHour * 60 + eventStartMinute;
      const eventEndMinutes = eventEndHour * 60 + eventEndMinute;
      const repeatMinutes = repeatHour * 60 + repeatMinute;

      // 반복 일정이 기존 일정의 시간 범위 내에 있는지 확인
      // endTime은 exclusive (포함하지 않음)
      return repeatMinutes >= eventStartMinutes && repeatMinutes < eventEndMinutes;
    });
  });
};

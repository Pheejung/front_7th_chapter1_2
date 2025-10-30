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
  // RED: 구현 안 함
  throw new Error('Not implemented');
};

/**
 * 일일 반복 일정 날짜 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜 (undefined면 시작 날짜로부터 1년까지)
 * @param interval - 반복 간격 (기본값: 1, N일마다 반복)
 * @returns 생성된 반복 날짜 배열
 */
export const getDailyRepeatDates = (_startDate: Date, _endDate?: Date, _interval: number = 1): Date[] => {
  // RED: 구현 안 함
  throw new Error('Not implemented');
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
  // RED: 구현 안 함
  throw new Error('Not implemented');
};

/**
 * 윤년 여부 판정
 * @param year - 검증할 연도
 * @returns 윤년이면 true, 아니면 false
 */
export const isLeapYear = (_year: number): boolean => {
  // RED: 구현 안 함
  throw new Error('Not implemented');
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
  // RED: 구현 안 함
  throw new Error('Not implemented');
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
  // RED: 구현 안 함
  throw new Error('Not implemented');
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
  // RED: 구현 안 함
  throw new Error('Not implemented');
};

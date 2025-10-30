import { describe, it, expect } from 'vitest';
import type { RepeatInfo } from '../../types';
import { validateRepeatInfo, getRepeatIcon } from '../../utils/repeatUtils';

/**
 * Task R-002 RED: 반복 일정 기능 테스트
 * 
 * 반복 정보 검증 및 반복 아이콘 표시 함수 테스트
 * RED 단계: validateRepeatInfo와 getRepeatIcon 함수가 아직 없어서 모든 테스트가 실패해야 함
 * 
 * 테스트 구조:
 * - validateRepeatInfo 함수: 반복 정보 검증 (아직 구현되지 않음)
 * - getRepeatIcon 함수: 반복 타입별 아이콘 (아직 구현되지 않음)
 * 
 * 참고: generateRepeatDates는 R-001의 반복 날짜 생성 함수들을 조합하므로 테스트 불필요
 */

describe('Task R-002 RED: 반복 일정 기능 확장', () => {
  // 테스트 픽스처: 반복 정보
  const dailyRepeat: RepeatInfo = {
    type: 'daily',
    interval: 1,
    endDate: '2025-12-31',
  };

  const weeklyRepeat: RepeatInfo = {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  };

  describe('정상 케이스: validateRepeatInfo 함수 테스트', () => {
    it('validateRepeatInfo 함수가 존재해야 한다', () => {
      // Arrange & Act & Assert
      expect(validateRepeatInfo).toBeDefined();
      expect(typeof validateRepeatInfo).toBe('function');
    });

    it('validateRepeatInfo는 유효한 반복 정보(daily)를 검증할 수 있어야 한다', () => {
      // Arrange
      const repeatInfo = dailyRepeat;
      const startDate = '2025-01-15';

      // Act & Assert
      expect(() => {
        validateRepeatInfo(repeatInfo, startDate);
      }).not.toThrow();
    });

    it('validateRepeatInfo는 유효한 반복 정보(weekly)를 검증할 수 있어야 한다', () => {
      // Arrange
      const repeatInfo = weeklyRepeat;
      const startDate = '2025-01-06';

      // Act & Assert
      expect(() => {
        validateRepeatInfo(repeatInfo, startDate);
      }).not.toThrow();
    });
  });

  describe('엣지 케이스: 반복 정보 검증 에러', () => {
    it('validateRepeatInfo는 반복 종료 날짜가 시작일 이전이면 에러를 발생시켜야 한다', () => {
      // Arrange
      const invalidRepeat: RepeatInfo = {
        type: 'daily',
        interval: 1,
        endDate: '2024-12-31', // 2025-01-15보다 이전
      };
      const startDate = '2025-01-15';

      // Act & Assert
      expect(() => {
        validateRepeatInfo(invalidRepeat, startDate);
      }).toThrow();
    });

    it('validateRepeatInfo는 반복 간격이 0이면 에러를 발생시켜야 한다', () => {
      // Arrange
      const invalidRepeat: RepeatInfo = {
        type: 'daily',
        interval: 0,
        endDate: '2025-12-31',
      };
      const startDate = '2025-01-15';

      // Act & Assert
      expect(() => {
        validateRepeatInfo(invalidRepeat, startDate);
      }).toThrow();
    });

    it('validateRepeatInfo는 반복 간격이 음수면 에러를 발생시켜야 한다', () => {
      // Arrange
      const invalidRepeat: RepeatInfo = {
        type: 'daily',
        interval: -1,
        endDate: '2025-12-31',
      };
      const startDate = '2025-01-15';

      // Act & Assert
      expect(() => {
        validateRepeatInfo(invalidRepeat, startDate);
      }).toThrow();
    });
  });

  describe('정상 케이스: getRepeatIcon 함수 테스트', () => {
    it('getRepeatIcon 함수가 존재해야 한다', () => {
      // Arrange & Act & Assert
      expect(getRepeatIcon).toBeDefined();
      expect(typeof getRepeatIcon).toBe('function');
    });

    it('getRepeatIcon는 daily 반복에 대한 아이콘을 반환해야 한다', () => {
      // Arrange
      const repeatType = 'daily';

      // Act & Assert
      const icon = getRepeatIcon(repeatType);
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
    });

    it('getRepeatIcon는 weekly 반복에 대한 아이콘을 반환해야 한다', () => {
      // Arrange
      const repeatType = 'weekly';

      // Act & Assert
      const icon = getRepeatIcon(repeatType);
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
    });

    it('getRepeatIcon는 monthly 반복에 대한 아이콘을 반환해야 한다', () => {
      // Arrange
      const repeatType = 'monthly';

      // Act & Assert
      const icon = getRepeatIcon(repeatType);
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
    });

    it('getRepeatIcon는 yearly 반복에 대한 아이콘을 반환해야 한다', () => {
      // Arrange
      const repeatType = 'yearly';

      // Act & Assert
      const icon = getRepeatIcon(repeatType);
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
    });

    it('getRepeatIcon는 다양한 반복 타입마다 다른 아이콘을 반환해야 한다', () => {
      // Arrange
      const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

      // Act & Assert
      const icons = repeatTypes.map(type => getRepeatIcon(type));
      
      // 모든 아이콘이 정의되어야 함
      expect(icons.every(icon => icon !== undefined)).toBe(true);
      
      // 아이콘들이 모두 다른지 확인
      const uniqueIcons = new Set(icons);
      expect(uniqueIcons.size).toBe(repeatTypes.length);
    });
  });
});

import {
  isValidRepeatType,
  getDailyRepeatDates,
  getWeeklyRepeatDates,
  getMonthlyRepeatDates,
  getYearlyRepeatDates,
  isLeapYear,
  filterOutOverlappingDates,
} from '../../utils/repeatUtils';

describe('repeatUtils - 반복 유형 선택', () => {
  describe('isValidRepeatType - 반복 유형 검증', () => {
    it('매일, 매주, 매월, 매년, 없음을 유효한 반복 타입으로 인정한다', () => {
      expect(isValidRepeatType('daily')).toBe(true);
      expect(isValidRepeatType('weekly')).toBe(true);
      expect(isValidRepeatType('monthly')).toBe(true);
      expect(isValidRepeatType('yearly')).toBe(true);
      expect(isValidRepeatType('none')).toBe(true);
    });

    it('유효하지 않은 값을 false로 반환한다', () => {
      expect(isValidRepeatType('invalid')).toBe(false);
      expect(isValidRepeatType('')).toBe(false);
      expect(isValidRepeatType(null as any)).toBe(false);
    });
  });

  describe('getDailyRepeatDates - 매일 반복 생성', () => {
    it('시작 날짜부터 종료 날짜까지 매일 일정을 생성한다', () => {
      const dates = getDailyRepeatDates(new Date('2025-01-01'), new Date('2025-01-05'));
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
      
      expect(dateStrings).toEqual([
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
      ]);
    });

    it('간격을 지정하면 N일마다 반복한다', () => {
      // 간격 2: 2일마다 반복 (1일, 3일, 5일, 7일, 9일...)
      const dates = getDailyRepeatDates(new Date('2025-01-01'), new Date('2025-01-10'), 2);
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
      expect(dateStrings).toEqual(['2025-01-01', '2025-01-03', '2025-01-05', '2025-01-07', '2025-01-09']);
    });

    it('월 경계를 넘어서도 매일 생성한다', () => {
      const dates = getDailyRepeatDates(new Date('2025-01-30'), new Date('2025-02-02'));
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
      
      expect(dateStrings).toContain('2025-01-31');
      expect(dateStrings).toContain('2025-02-01');
      expect(dateStrings).toContain('2025-02-02');
    });

    it('시작 > 종료이면 빈 배열을 반환한다', () => {
      expect(getDailyRepeatDates(new Date('2025-01-05'), new Date('2025-01-01'))).toEqual([]);
    });
  });

  describe('getWeeklyRepeatDates - 매주 반복 생성', () => {
    it('시작 날짜의 요일과 같은 요일마다 매주 일정을 생성한다', () => {
      const startDate = new Date('2025-01-06'); // 월요일
      const endDate = new Date('2025-01-27');
      const dates = getWeeklyRepeatDates(startDate, endDate);
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

      // 모든 날짜가 같은 요일인지 확인
      expect(dates.every((d) => d.getDay() === startDate.getDay())).toBe(true);
      
      // 주 단위 간격 확인 (월요일: 1월 6일, 13일, 20일, 27일)
      expect(dateStrings).toContain('2025-01-06');
      expect(dateStrings).toContain('2025-01-13');
      expect(dateStrings).toContain('2025-01-20');
      expect(dateStrings).toContain('2025-01-27');
    });

    it('간격을 지정하면 N주마다 반복한다', () => {
      // 간격 2: 2주마다 반복 (1월 6일, 20일, 2월 3일)
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-02-03');
      const dates = getWeeklyRepeatDates(startDate, endDate, 2);
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
      expect(dateStrings).toContain('2025-01-06');
      expect(dateStrings).toContain('2025-01-20');
      expect(dateStrings).toContain('2025-02-03');
      expect(dateStrings).not.toContain('2025-01-13');
    });

    it('월 경계를 넘어서도 같은 요일마다 생성한다', () => {
      const startDate = new Date('2025-01-31'); // 금요일
      const endDate = new Date('2025-02-21');
      const dates = getWeeklyRepeatDates(startDate, endDate);
      const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

      expect(dateStrings).toContain('2025-01-31');
      expect(dateStrings).toContain('2025-02-07');
      expect(dateStrings).toContain('2025-02-14');
      expect(dateStrings).toContain('2025-02-21');
    });

    it('시작 > 종료이면 빈 배열을 반환한다', () => {
      expect(getWeeklyRepeatDates(new Date('2025-01-20'), new Date('2025-01-06'))).toEqual([]);
    });
  });

  describe('getMonthlyRepeatDates - 매월 반복 생성', () => {
    describe('31일 반복: 31일에만 생성하세요', () => {
      it('31일이 있는 달에는 31일을 생성한다', () => {
        const dates = getMonthlyRepeatDates(new Date('2025-01-31'), new Date('2025-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 31일이 있는 달: 1월, 3월, 5월, 7월, 8월, 10월, 12월
        expect(dateStrings).toContain('2025-01-31');
        expect(dateStrings).toContain('2025-03-31');
        expect(dateStrings).toContain('2025-05-31');
        expect(dateStrings).toContain('2025-07-31');
        expect(dateStrings).toContain('2025-08-31');
        expect(dateStrings).toContain('2025-10-31');
        expect(dateStrings).toContain('2025-12-31');
      });

      it('31일 반복에서 간격을 지정하면 N개월마다 생성한다', () => {
        // 간격 2: 2개월마다 31일 반복 (1월, 3월, 5월...)
        const dates = getMonthlyRepeatDates(new Date('2025-01-31'), new Date('2025-12-31'), 2);
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
        expect(dateStrings).toContain('2025-01-31');
        expect(dateStrings).toContain('2025-03-31');
        expect(dateStrings).toContain('2025-05-31');
        expect(dateStrings).not.toContain('2025-02-28');
      });

      it('31일이 없는 달(2월, 4월, 6월, 9월, 11월)에는 생성하지 않는다', () => {
        const dates = getMonthlyRepeatDates(new Date('2025-01-31'), new Date('2025-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 31일이 없는 달
        expect(dateStrings.filter((d) => d.startsWith('2025-02')).length).toBe(0);
        expect(dateStrings.filter((d) => d.startsWith('2025-04')).length).toBe(0);
        expect(dateStrings.filter((d) => d.startsWith('2025-06')).length).toBe(0);
        expect(dateStrings.filter((d) => d.startsWith('2025-09')).length).toBe(0);
        expect(dateStrings.filter((d) => d.startsWith('2025-11')).length).toBe(0);
      });
    });

    describe('30일 반복: 30일 이상인 달에 생성', () => {
      it('30일 이상인 달에는 30일을 생성한다', () => {
        const dates = getMonthlyRepeatDates(new Date('2025-01-30'), new Date('2025-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 30일 이상인 달: 1월, 3월, 4월, 5월, 6월, 7월, 8월, 9월, 10월, 11월, 12월
        expect(dateStrings).toContain('2025-01-30');
        expect(dateStrings).toContain('2025-03-30');
        expect(dateStrings).toContain('2025-04-30');
        expect(dateStrings).toContain('2025-05-30');
        expect(dateStrings).toContain('2025-06-30');
        expect(dateStrings).toContain('2025-09-30');
        expect(dateStrings).toContain('2025-11-30');
      });

      it('30일 반복에서 간격을 지정하면 N개월마다 생성한다', () => {
        // 간격 3: 3개월마다 30일 반복 (1월, 4월, 7월, 10월)
        const dates = getMonthlyRepeatDates(new Date('2025-01-30'), new Date('2025-12-31'), 3);
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
        expect(dateStrings).toContain('2025-01-30');
        expect(dateStrings).toContain('2025-04-30');
        expect(dateStrings).toContain('2025-07-30');
        expect(dateStrings).toContain('2025-10-30');
      });

      it('2월(30일 미만)에는 생성하지 않는다', () => {
        const dates = getMonthlyRepeatDates(new Date('2025-01-30'), new Date('2025-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        expect(dateStrings.filter((d) => d.startsWith('2025-02')).length).toBe(0);
      });
    });

    it('시작 > 종료이면 빈 배열을 반환한다', () => {
      expect(getMonthlyRepeatDates(new Date('2025-12-31'), new Date('2025-01-31'))).toEqual([]);
    });
  });

  describe('getYearlyRepeatDates - 매년 반복 생성', () => {
    describe('일반적인 년도: 매년 같은 날짜 생성', () => {
      it('매년 같은 날짜에 일정을 생성한다', () => {
        const dates = getYearlyRepeatDates(new Date('2024-01-15'), new Date('2026-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        expect(dateStrings).toContain('2024-01-15');
        expect(dateStrings).toContain('2025-01-15');
        expect(dateStrings).toContain('2026-01-15');
      });

      it('간격을 지정하면 N년마다 반복한다', () => {
        // 간격 2: 2년마다 반복 (2024년, 2026년, 2028년, 2030년)
        const dates = getYearlyRepeatDates(new Date('2024-01-15'), new Date('2030-12-31'), 2);
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
        expect(dateStrings).toContain('2024-01-15');
        expect(dateStrings).toContain('2026-01-15');
        expect(dateStrings).toContain('2028-01-15');
        expect(dateStrings).toContain('2030-01-15');
        expect(dateStrings).not.toContain('2025-01-15');
      });
    });

    describe('윤년 29일 반복: 29일에만 생성하세요', () => {
      it('2월 29일은 윤년에만 생성한다', () => {
        const dates = getYearlyRepeatDates(new Date('2020-02-29'), new Date('2030-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 윤년에만 생성
        expect(dateStrings).toContain('2020-02-29');
        expect(dateStrings).toContain('2024-02-29');
        expect(dateStrings).toContain('2028-02-29');
      });

      it('2월 29일은 평년에는 생성하지 않는다', () => {
        const dates = getYearlyRepeatDates(new Date('2020-02-29'), new Date('2030-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 평년에는 생성 안함
        expect(dateStrings).not.toContain('2021-02-29');
        expect(dateStrings).not.toContain('2022-02-29');
        expect(dateStrings).not.toContain('2023-02-29');
        expect(dateStrings).not.toContain('2025-02-29');
        expect(dateStrings).not.toContain('2026-02-29');
        expect(dateStrings).not.toContain('2027-02-29');
        expect(dateStrings).not.toContain('2029-02-29');
        expect(dateStrings).not.toContain('2030-02-29');
      });

      it('윤년 29일 반복에서 간격을 지정하면 N년마다 생성 (윤년에만)', () => {
        // 간격 2: 2년마다 윤년 (2020년, 2024년, 2028년)
        const dates = getYearlyRepeatDates(new Date('2020-02-29'), new Date('2030-12-31'), 2);
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);
        expect(dateStrings).toContain('2020-02-29');
        expect(dateStrings).toContain('2024-02-29');
        expect(dateStrings).toContain('2028-02-29');
      });

      it('century 년도 윤년 규칙: 400의 배수만 생성', () => {
        const dates = getYearlyRepeatDates(new Date('2000-02-29'), new Date('2401-12-31'));
        const dateStrings = dates.map((d) => d.toISOString().split('T')[0]);

        // 400의 배수 = 윤년
        expect(dateStrings).toContain('2000-02-29');
        expect(dateStrings).toContain('2400-02-29');

        // 100의 배수이지만 400의 배수 아님 = 평년
        expect(dateStrings.filter((d) => d.includes('2100-02-29')).length).toBe(0);
        expect(dateStrings.filter((d) => d.includes('2200-02-29')).length).toBe(0);
        expect(dateStrings.filter((d) => d.includes('2300-02-29')).length).toBe(0);
      });
    });

    it('시작 > 종료이면 빈 배열을 반환한다', () => {
      expect(getYearlyRepeatDates(new Date('2026-12-31'), new Date('2024-01-01'))).toEqual([]);
    });
  });

  describe('isLeapYear - 윤년 판정', () => {
    it('4의 배수는 윤년이다 (100의 배수 제외)', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2016)).toBe(true);
    });

    it('4의 배수가 아니면 평년이다', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2022)).toBe(false);
      expect(isLeapYear(2021)).toBe(false);
    });

    it('100의 배수는 400의 배수일 때만 윤년이다', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
      expect(isLeapYear(2200)).toBe(false);
    });
  });

  describe('filterOutOverlappingDates - 반복일정은 일정 겹침을 고려하지 않는다', () => {
    it('겹치는 일정이 없으면 모든 반복 날짜를 반환한다', () => {
      const repeatDates = [
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        new Date('2025-01-03'),
      ];
      const existingEvents: any[] = [];

      const filtered = filterOutOverlappingDates(repeatDates, existingEvents);

      expect(filtered).toEqual(repeatDates);
    });

    it('겹치는 일정이 있으면 해당 날짜를 제거한다', () => {
      const repeatDates = [
        new Date('2025-01-01'),
        new Date('2025-01-02'),
        new Date('2025-01-03'),
      ];
      const existingEvents = [
        { date: '2025-01-02', startTime: '10:00', endTime: '11:00' },
        { date: '2025-01-03', startTime: '14:00', endTime: '15:00' },
      ];

      const filtered = filterOutOverlappingDates(repeatDates, existingEvents);
      const dateStrings = filtered.map((d) => d.toISOString().split('T')[0]);

      expect(dateStrings).toEqual(['2025-01-01']);
    });

    it('시간 겹침도 정확히 판정한다', () => {
      const repeatDates = [
        new Date('2025-01-01T10:00:00'),
        new Date('2025-01-01T10:30:00'),
        new Date('2025-01-01T14:00:00'),
      ];
      const existingEvents = [
        { date: '2025-01-01', startTime: '10:00', endTime: '11:00' },
      ];

      const filtered = filterOutOverlappingDates(repeatDates, existingEvents);

      // 10:00과 10:30은 겹침, 14:00은 안겹침
      expect(filtered.length).toBe(1);
      expect(filtered[0].getHours()).toBe(14);
    });

    it('시간이 겹치지 않으면 유지한다', () => {
      const repeatDates = [new Date('2025-01-01T11:00:00')];
      const existingEvents = [
        { date: '2025-01-01', startTime: '10:00', endTime: '11:00' },
      ];

      const filtered = filterOutOverlappingDates(repeatDates, existingEvents);

      // 경계선 11:00은 겹치지 않음 (endTime 직후)
      expect(filtered.length).toBe(1);
    });

    it('빈 배열을 입력하면 빈 배열을 반환한다', () => {
      const filtered = filterOutOverlappingDates([], []);

      expect(filtered).toEqual([]);
    });
  });
});

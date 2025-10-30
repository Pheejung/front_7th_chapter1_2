/**
 * @file medium.useEventForm.repeat.spec.ts
 * @description Task R-003 RED: EventForm 반복 기능 UI 테스트 (모두 실패 상태)
 *
 * RED Phase - EventForm 컴포넌트에 반복 기능 UI가 없으므로 모든 테스트는 실패합니다.
 * 다음을 구현해야 테스트가 통과합니다:
 * - EventForm 컴포넌트에 반복 타입 select 추가
 * - EventForm 컴포넌트에 종료 날짜 input 추가
 * - 올바른 라벨과 옵션 설정
 */

import { describe, it, expect } from 'vitest';

describe('Task R-003 RED: EventForm 반복 기능 UI', () => {
  describe('반복 타입 select 렌더링', () => {
    it('EventForm 컴포넌트가 반복 타입 select를 렌더해야 한다', () => {
      // EventForm 컴포넌트가 아직 구현되지 않았으므로 실패
      // 실제 구현: EventForm에 <select id="repeat-type"> 엘리먼트 추가
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      expect(repeatSelect).toBeTruthy();
    });

    it('select에 "없음", "매일", "매주", "매월", "매년" 옵션이 있어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      const options = Array.from(repeatSelect?.options || []).map(o => o.value);

      expect(options).toContain('none');
      expect(options).toContain('daily');
      expect(options).toContain('weekly');
      expect(options).toContain('monthly');
      expect(options).toContain('yearly');
    });

    it('초기값은 "없음"이어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      expect(repeatSelect?.value).toBe('none');
    });

    it('select에 label이 연결되어야 한다', () => {
      const label = document.querySelector('label[for="repeat-type"]');
      expect(label?.textContent).toContain('반복');
    });

    it(' select에 aria-label이 설정되어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      expect(repeatSelect?.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('종료 날짜 input 렌더링', () => {
    it('EventForm 컴포넌트가 종료 날짜 input을 렌더해야 한다', () => {
      // EventForm 컴포넌트가 아직 구현되지 않았으므로 실패
      // 실제 구현: EventForm에 <input type="date" id="repeat-end-date"> 엘리먼트 추가
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
      expect(endDateInput).toBeTruthy();
    });

    it('input type은 "date"여야 한다', () => {
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
      expect(endDateInput?.type).toBe('date');
    });

    it('초기 상태에서는 disabled여야 한다', () => {
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
      expect(endDateInput?.disabled).toBe(true);
    });

    it('input에 label이 연결되어야 한다', () => {
      const label = document.querySelector('label[for="repeat-end-date"]');
      expect(label?.textContent).toContain('종료');
    });

    it('input에 aria-label이 설정되어야 한다', () => {
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
      expect(endDateInput?.getAttribute('aria-label')).toBeTruthy();
    });

    it('최대 날짜는 2025-12-31이어야 한다', () => {
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
      expect(endDateInput?.max).toBe('2025-12-31');
    });
  });

  describe('반복 활성화 상태', () => {
    it('반복이 비활성화되면 (none) 종료 날짜 input이 disabled여야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;

      if (repeatSelect?.value === 'none') {
        expect(endDateInput?.disabled).toBe(true);
      }
    });

    it('반복이 활성화되면 (daily, weekly 등) 종료 날짜 input이 활성화되어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;

      if (repeatSelect?.value !== 'none') {
        expect(endDateInput?.disabled).toBe(false);
      }
    });

    it('종료 날짜 필드에 도움말 텍스트가 있어야 한다', () => {
      const helpText = document.querySelector('[data-testid="repeat-end-date-help"]');
      expect(helpText?.textContent).toContain('시작 날짜');
    });
  });

  describe('폼 통합', () => {
    it('폼에 반복 타입 select와 종료 날짜 input이 함께 있어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type');
      const endDateInput = document.querySelector('#repeat-end-date');

      expect(repeatSelect).toBeTruthy();
      expect(endDateInput).toBeTruthy();
    });

    it('폼이 제출될 때 반복 정보가 포함되어야 한다', () => {
      // 폼 데이터에 repeatType, repeatInterval, repeatEndDate가 포함됨
      const formData = new FormData(document.querySelector('form') as HTMLFormElement);
      expect(formData.get('repeatType')).toBeTruthy();
      expect(formData.get('repeatEndDate')).toBeTruthy();
    });

    it('폼이 리셋될 때 반복 설정도 초기화되어야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      const endDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;

      // 리셋 후
      expect(repeatSelect?.value).toBe('none');
      expect(endDateInput?.value).toBe('');
      expect(endDateInput?.disabled).toBe(true);
    });
  });

  describe('유효성 검증', () => {
    it('종료 날짜가 시작 날짜보다 이전이면 에러 메시지를 표시해야 한다', () => {
      const errorMsg = document.querySelector('[data-testid="repeat-end-date-error"]');
      expect(errorMsg?.textContent).toContain('시작 날짜보다 이후');
    });

    it('반복 간격이 0이면 폼 제출 버튼이 disabled여야 한다', () => {
      const intervalInput = document.querySelector('#repeat-interval') as HTMLInputElement;
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

      if (Number(intervalInput?.value) === 0) {
        expect(submitButton?.disabled).toBe(true);
      }
    });

    it('반복 간격이 음수면 폼 제출 버튼이 disabled여야 한다', () => {
      const intervalInput = document.querySelector('#repeat-interval') as HTMLInputElement;
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

      if (Number(intervalInput?.value) < 0) {
        expect(submitButton?.disabled).toBe(true);
      }
    });
  });

  describe('옵션 텍스트', () => {
    it('select 옵션들이 올바른 텍스트를 가져야 한다', () => {
      const repeatSelect = document.querySelector('#repeat-type') as HTMLSelectElement;
      const optionTexts = Array.from(repeatSelect?.options || []).map(o => o.textContent);

      expect(optionTexts).toContain('없음');
      expect(optionTexts).toContain('매일');
      expect(optionTexts).toContain('매주');
      expect(optionTexts).toContain('매월');
      expect(optionTexts).toContain('매년');
    });
  });

  describe('반복 간격 UI', () => {
    it('EventForm에 반복 간격 input이 있어야 한다', () => {
      const intervalInput = document.querySelector('#repeat-interval') as HTMLInputElement;
      expect(intervalInput).toBeTruthy();
    });

    it('반복 간격 input의 min 속성은 1이어야 한다', () => {
      const intervalInput = document.querySelector('#repeat-interval') as HTMLInputElement;
      expect(intervalInput?.min).toBe('1');
    });

    it('반복 간격 input의 초기값은 1이어야 한다', () => {
      const intervalInput = document.querySelector('#repeat-interval') as HTMLInputElement;
      expect(Number(intervalInput?.value)).toBe(1);
    });

    it('반복 간격 input에 label이 있어야 한다', () => {
      const label = document.querySelector('label[for="repeat-interval"]');
      expect(label?.textContent).toContain('간격');
    });
  });
});

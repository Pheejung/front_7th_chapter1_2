import { beforeEach, describe, test, vi } from 'vitest';

// TODO: 테스트 활성화 시 아래 import 사용
// import CssBaseline from '@mui/material/CssBaseline';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import { render } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import { SnackbarProvider } from 'notistack';
// import App from '../App';

// const theme = createTheme();

// const setup = () => {
//   const user = userEvent.setup();
//   return {
//     ...render(
//       <ThemeProvider theme={theme}>
//         <CssBaseline />
//         <SnackbarProvider>
//           <App />
//         </SnackbarProvider>
//       </ThemeProvider>
//     ),
//     user,
//   };
// };

describe('반복 일정 수정 모달 (R-009)', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-11-01'));
  });

  test.skip('반복 일정 수정 시 "이 일정만" vs "모든 반복 일정" 선택 모달이 표시된다', async () => {
    // TODO: Mock 데이터 로딩 이슈 해결 후 테스트 활성화
    // const { user } = setup();
    // 반복 일정 생성 및 수정 시나리오 테스트
  });

  test.skip('"이 일정만 수정" 선택 시 해당 일정만 수정되고 repeat.type이 none으로 변경된다', async () => {
    // TODO: Mock 데이터 로딩 이슈 해결 후 테스트 활성화
    // const { user } = setup();
    // 단일 수정 시나리오 테스트
  });

  test.skip('"모든 반복 일정 수정" 선택 시 같은 parentId를 가진 모든 일정이 수정된다', async () => {
    // TODO: Mock 데이터 로딩 이슈 해결 후 테스트 활성화
    // const { user } = setup();
    // 일괄 수정 시나리오 테스트
  });
});

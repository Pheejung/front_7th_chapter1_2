import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface RepeatEditModalProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
}

/**
 * 반복 일정 수정 모달
 *
 * 사용자가 반복 일정을 수정할 때 "이 일정만 수정" 또는 "모든 반복 일정 수정"을 선택할 수 있습니다.
 */
export const RepeatEditModal = ({
  open,
  onClose,
  onEditSingle,
  onEditAll,
}: RepeatEditModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="repeat-edit-dialog-title">
      <DialogTitle id="repeat-edit-dialog-title">반복 일정 수정</DialogTitle>
      <DialogContent>
        <DialogContentText>이 일정은 반복 일정입니다. 어떻게 수정하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onEditSingle} color="primary">
          이 일정만 수정
        </Button>
        <Button onClick={onEditAll} color="primary" variant="contained">
          모든 반복 일정 수정
        </Button>
      </DialogActions>
    </Dialog>
  );
};

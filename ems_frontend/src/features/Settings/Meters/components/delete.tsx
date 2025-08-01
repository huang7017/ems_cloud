import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { actions } from "../reducer";

const Delete = ({
  open,

  recordId,
  setOpen,
}: {
  open: boolean;
  lng: string;
  recordId: string | null;
  setOpen: (value: boolean) => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const dispatch = useDispatch();
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    if (recordId === null) return;
    
    setSubmitting(true);
    
    try {
      dispatch(actions.deleteMeter(recordId as string));
      handleClose();
    } catch (err) {
      console.error("Error deleting meter record:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      slotProps={{
        paper: {
          component: "form",
          style: { width: "500px" },
        },
      }}
    >
      <DialogTitle>{ "刪除"}</DialogTitle>
      <DialogContent>
        <Typography>
          { "確定要刪除此電表記錄嗎？此操作無法撤銷。"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          { "取消"}
        </Button>
        <Button 
          onClick={handleDelete} 
          disabled={submitting}
          variant="contained"
          color="error"
        >
          {submitting ?  "刪除中..." : "確認刪除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Delete;

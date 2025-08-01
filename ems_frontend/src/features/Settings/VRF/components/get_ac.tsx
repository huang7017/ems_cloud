import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../reducer";
import type { IState } from "@/store/reducers";

const GetAc = ({
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
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: IState) => state.vrf);
  
  const handleClose = () => {
    dispatch(actions.clearError());
    setShowError(false);
    setErrorMessage("");
    setOpen(false);
  };

  const handleErrorClose = () => {
    setShowError(false);
  };
  
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowError(true);
    }
  }, [error]);
  
  useEffect(() => {
    setSubmitting(loading);
    
    // If loading is false and there's no error, it means the operation was successful
    if (!loading && !error && submitting) {
      handleClose();
    }
  }, [loading, error, submitting, handleClose]);

  const handleGetAC = () => {
    if (recordId === null) return;
    setSubmitting(true);
    dispatch(actions.createVrfAC(recordId));
  };

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          component: "form",
          style: { width: "500px" },
        }}
        onClose={handleClose}
      >
        <DialogTitle>{"取得空調"}</DialogTitle>
        <DialogContent>
          <Typography>
            {"確定要取得此VRF系統下的空調嗎？"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            {"取消"}
          </Button>
          <Button 
            onClick={handleGetAC} 
            disabled={submitting}
            variant="contained"
            color="primary"
          >
            {submitting ? "處理中..." : "確認"}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GetAc;

"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,

} from "@mui/material";
import { useDispatch } from "react-redux";
import { actions } from "../reducer";

const Edit = ({
  open,

  model,
  setOpen,
}: {
  open: boolean;
  lng: string;
  model: string;
  setOpen: (value: boolean) => void;
}) => {
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const dispatch = useDispatch();
  
  const handleClose = () => {
    setOpen(false);
    setAddress("");
    setError("");
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      setError("地址欄位必填");
      return;
    }
    
    setError("");
    setSubmitting(true);
    
    try {
      if (model === "create") {
        dispatch(actions.createTemperature({ address } as any));
      }
      
      handleClose();
    } catch (err) {
      setError( "提交過程發生錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{
        component: "form",
        style: { width: "600px" }, // Adjust dialog width
      }}
    >
      <DialogTitle>{model}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          margin="dense"
          id="address"
          name="address"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          label={'address'}
          type="text"
          fullWidth
          variant="standard"
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>取消</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          variant="contained"
        >
          {submitting ?  "提交中..." : "確定"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Edit;

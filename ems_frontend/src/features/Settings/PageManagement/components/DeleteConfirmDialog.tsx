import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useSelector } from "react-redux";
import { isDeleteDialogOpenSelector, selectedPageSelector } from "../selector";

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  translate: (key: string, params?: Record<string, string | number>) => string;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  onConfirm,
  onCancel,
  translate,
}) => {
  const isOpen = useSelector(isDeleteDialogOpenSelector);
  const selectedPage = useSelector(selectedPageSelector);

  return (
    <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          {translate("confirm_delete")}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {translate("confirm_delete_page", {
            title: selectedPage?.title || "",
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {translate("delete_warning")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{translate("cancel")}</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {translate("delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;

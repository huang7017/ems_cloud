import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import type { Role } from "../types";

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onSubmit: (roleData: Partial<Role>) => void;
}

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  onClose,
  role,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    permissions: role?.permissions || [],
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        permissions: role.permissions,
      });
    } else {
      setFormData({
        name: "",
        permissions: [],
      });
    }
  }, [role]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{role ? "編輯角色" : "新增角色"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="角色名稱"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            權限設定
          </Typography>
          {/* Permission checkboxes would go here */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained">
          {role ? "更新" : "新增"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;

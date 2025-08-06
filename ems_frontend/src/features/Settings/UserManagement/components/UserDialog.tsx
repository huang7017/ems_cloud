import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import type { User, Role } from "../types";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  roles: Role[];
  onSubmit: (userData: Partial<User>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  user,
  roles,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    status: user?.status || "enabled",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "",
        status: "enabled",
      });
    }
  }, [user]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? "編輯用戶" : "新增用戶"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="用戶名稱"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="電子郵件"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>角色</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              label="角色"
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={formData.status === "enabled"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.checked ? "enabled" : "disabled",
                  })
                }
              />
            }
            label="啟用狀態"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained">
          {user ? "更新" : "新增"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;

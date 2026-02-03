import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Checkbox,
  FormGroup,
  Paper,
  TextField,
} from "@mui/material";
import type { User, Role } from "../types";

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  roles: Role[];
  onSubmit: (userData: Partial<User> & { roleIds?: number[]; password?: string }) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  user,
  roles,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "enabled" as "enabled" | "disabled",
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 編輯模式：user 存在；創建模式：user 為 null
  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      // 編輯模式：填充現有數據
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // 編輯時不顯示密碼
        status: user.status,
      });
      setSelectedRoleIds(user.roles.map((r) => r.id));
    } else {
      // 創建模式：重置表單
      setFormData({
        name: "",
        email: "",
        password: "",
        status: "enabled",
      });
      setSelectedRoleIds([]);
    }
    setErrors({ name: "", email: "", password: "" });
  }, [user, open]);

  const handleToggle = (roleId: number) => {
    setSelectedRoleIds((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const validateForm = () => {
    const newErrors = { name: "", email: "", password: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "姓名不能為空";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "郵箱不能為空";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "郵箱格式不正確";
      isValid = false;
    }

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "密碼不能為空";
      isValid = false;
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = "密碼至少 6 個字符";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const submitData: any = {
      name: formData.name,
      email: formData.email,
      status: formData.status,
      roleIds: selectedRoleIds,
    };

    if (isEditMode) {
      submitData.id = user!.id;
      // 編輯模式下，只有提供了密碼才包含
      if (formData.password.trim()) {
        submitData.password = formData.password;
      }
    } else {
      // 創建模式下，密碼是必須的
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  const isSubmitDisabled = () => {
    if (isEditMode && user) {
      // 編輯模式：檢查是否有變更
      const hasChanges =
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.status !== user.status ||
        formData.password.trim() !== "" ||
        selectedRoleIds.length !== user.roles.length ||
        selectedRoleIds.some((id) => !user.roles.find((r) => r.id === id));
      return !hasChanges;
    }
    // 創建模式：檢查必填項
    return !formData.name || !formData.email || !formData.password || selectedRoleIds.length === 0;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? "編輯用戶" : "新增用戶"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* 基本信息 */}
          <TextField
            label="姓名"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="郵箱"
            fullWidth
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label={isEditMode ? "新密碼（留空則不修改）" : "密碼"}
            fullWidth
            required={!isEditMode}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password || (isEditMode ? "留空則不修改密碼" : "")}
          />

          <Divider sx={{ my: 1 }} />

          {/* 角色分配 */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              角色分配 *
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              選擇此用戶應擁有的角色（可多選）
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: "#f8f9fa", maxHeight: 300, overflow: "auto" }}>
              <FormGroup>
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => handleToggle(role.id)}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* 狀態 */}
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
            label={
              <Box>
                <Typography variant="body1">
                  {formData.status === "enabled" ? "啟用" : "停用"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.status === "enabled"
                    ? "用戶可以正常登錄系統"
                    : "用戶將無法登錄系統"}
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled()}
        >
          {isEditMode ? "保存" : "創建"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;

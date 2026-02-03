import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  IconButton,
  Typography,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { actions } from "./reducer";
import {
  selectPowers,
  selectMenus,
  selectLoading,
  selectSnackbar,
} from "./selector";
import type { Power, PowerRequest } from "./types";

const PowerManagement: React.FC = () => {
  const dispatch = useDispatch();

  // Redux state
  const powers = useSelector(selectPowers);
  const menus = useSelector(selectMenus);
  const loading = useSelector(selectLoading);
  const snackbar = useSelector(selectSnackbar);

  // Local dialog state
  const [open, setOpen] = useState(false);
  const [editingPower, setEditingPower] = useState<Power | null>(null);
  const [formData, setFormData] = useState<PowerRequest>({
    menu_id: 0,
    title: "",
    code: "",
    description: "",
    sort: 0,
    is_enable: true,
  });

  // Load powers and menus on mount
  useEffect(() => {
    dispatch(actions.fetchPowers());
    dispatch(actions.fetchMenus());
  }, [dispatch]);

  const handleOpen = (power?: Power) => {
    if (power) {
      setEditingPower(power);
      setFormData({
        id: power.id,
        menu_id: power.menu_id,
        title: power.title,
        code: power.code,
        description: power.description,
        sort: power.sort,
        is_enable: power.is_enable,
      });
    } else {
      setEditingPower(null);
      setFormData({
        menu_id: menus[0]?.id || 0,
        title: "",
        code: "",
        description: "",
        sort: 0,
        is_enable: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPower(null);
  };

  const handleSubmit = () => {
    if (editingPower) {
      dispatch(actions.updatePower(formData));
    } else {
      dispatch(actions.createPower(formData));
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("確定要刪除此權限嗎？")) {
      return;
    }
    dispatch(actions.deletePower(id));
  };

  const handleCloseSnackbar = () => {
    dispatch(actions.closeSnackbar());
  };

  const getMenuName = (menuId: number) => {
    const menu = menus.find((m) => m.id === menuId);
    return menu?.title || `Menu ${menuId}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">權限管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          新增權限
        </Button>
      </Box>

      {loading && powers.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>權限名稱</TableCell>
                <TableCell>權限代碼</TableCell>
                <TableCell>所屬菜單</TableCell>
                <TableCell>排序</TableCell>
                <TableCell>啟用</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {powers.map((power) => (
                <TableRow key={power.id}>
                  <TableCell>{power.id}</TableCell>
                  <TableCell>{power.title}</TableCell>
                  <TableCell>
                    <code>{power.code}</code>
                  </TableCell>
                  <TableCell>{getMenuName(power.menu_id)}</TableCell>
                  <TableCell>{power.sort}</TableCell>
                  <TableCell>
                    <Switch checked={power.is_enable} disabled />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(power)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(power.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPower ? "編輯權限" : "新增權限"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>所屬菜單</InputLabel>
              <Select
                value={formData.menu_id}
                label="所屬菜單"
                onChange={(e) =>
                  setFormData({ ...formData, menu_id: Number(e.target.value) })
                }
              >
                {menus.map((menu) => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="權限名稱"
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              label="權限代碼"
              fullWidth
              required
              placeholder="例如: menu:create"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              helperText="格式: resource:action (例如: menu:create, user:delete)"
            />
            <TextField
              label="描述"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              label="排序"
              type="number"
              fullWidth
              value={formData.sort}
              onChange={(e) =>
                setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
              }
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography>啟用</Typography>
              <Switch
                checked={formData.is_enable}
                onChange={(e) =>
                  setFormData({ ...formData, is_enable: e.target.checked })
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "保存"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PowerManagement;

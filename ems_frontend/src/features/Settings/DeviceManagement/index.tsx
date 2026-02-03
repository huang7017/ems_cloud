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
  IconButton,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Search,
  QrCode,
} from "@mui/icons-material";
import { actions } from "./reducer";
import {
  selectDevices,
  selectLoading,
  selectSnackbar,
} from "./selector";
import type { Device, DeviceRequest } from "./types";

const DeviceManagement: React.FC = () => {
  const dispatch = useDispatch();

  // Redux state
  const devices = useSelector(selectDevices);
  const loading = useSelector(selectLoading);
  const snackbar = useSelector(selectSnackbar);

  // Local state
  const [open, setOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<DeviceRequest>({ sn: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Load devices on mount
  useEffect(() => {
    dispatch(actions.fetchDevices());
  }, [dispatch]);

  // Filter devices by search term
  const filteredDevices = devices.filter((device) =>
    device.sn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setFormData({ id: device.id, sn: device.sn });
    } else {
      setEditingDevice(null);
      setFormData({ sn: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDevice(null);
    setFormData({ sn: "" });
  };

  const handleSubmit = () => {
    if (!formData.sn.trim()) {
      return;
    }

    if (editingDevice) {
      dispatch(actions.updateDevice({ id: editingDevice.id, data: formData }));
    } else {
      dispatch(actions.createDevice(formData));
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("確定要刪除此設備嗎？此操作無法復原。")) {
      return;
    }
    dispatch(actions.deleteDevice(id));
  };

  const handleCloseSnackbar = () => {
    dispatch(actions.closeSnackbar());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("zh-TW");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QrCode color="primary" />
            設備管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            管理設備 SN 碼（僅限系統管理員）
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          新增設備
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="搜尋 SN 碼..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Chip
          label={`共 ${filteredDevices.length} 個設備`}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      {/* Device Table */}
      {loading && devices.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>SN 碼</TableCell>
                <TableCell>創建時間</TableCell>
                <TableCell>修改時間</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      {searchTerm ? "沒有符合搜尋條件的設備" : "暫無設備數據"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => (
                  <TableRow key={device.id} hover>
                    <TableCell>{device.id}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          backgroundColor: "#f5f5f5",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: "inline-block",
                        }}
                      >
                        {device.sn}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(device.create_time)}</TableCell>
                    <TableCell>{formatDate(device.modify_time)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpen(device)}
                        title="編輯"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(device.id)}
                        title="刪除"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDevice ? "編輯設備" : "新增設備"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="SN 碼"
              fullWidth
              required
              autoFocus
              placeholder="請輸入設備 SN 碼"
              value={formData.sn}
              onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCode />
                  </InputAdornment>
                ),
              }}
              helperText="SN 碼必須唯一，用於識別設備"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.sn.trim()}
          >
            {loading ? <CircularProgress size={20} /> : "保存"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default DeviceManagement;

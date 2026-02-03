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
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Edit, Delete, Add, Security } from "@mui/icons-material";
import { actions } from "./reducer";
import {
  selectRoles,
  selectAllPowers,
  selectMenus,
  selectSelectedPowerIds,
  selectLoading,
  selectLoadingPermissions,
  selectSavingPermissions,
  selectSnackbar,
  selectGroupedPowers,
} from "./selector";
import type { Role, RoleRequest } from "./types";

const RoleManagement: React.FC = () => {
  const dispatch = useDispatch();

  // Redux state
  const roles = useSelector(selectRoles);
  const allPowers = useSelector(selectAllPowers);
  const menus = useSelector(selectMenus);
  const selectedPowerIds = useSelector(selectSelectedPowerIds);
  const loading = useSelector(selectLoading);
  const loadingPermissions = useSelector(selectLoadingPermissions);
  const savingPermissions = useSelector(selectSavingPermissions);
  const snackbar = useSelector(selectSnackbar);
  const groupedPowers = useSelector(selectGroupedPowers);

  // Local dialog state
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleRequest>({
    title: "",
    description: "",
    sort: 0,
    is_enable: true,
  });
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Load roles on mount
  useEffect(() => {
    dispatch(actions.fetchRoles());
  }, [dispatch]);

  const handleOpen = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        id: role.id,
        title: role.title,
        description: role.description,
        sort: role.sort,
        is_enable: role.is_enable,
      });
    } else {
      setEditingRole(null);
      setFormData({
        title: "",
        description: "",
        sort: 0,
        is_enable: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = () => {
    if (editingRole) {
      dispatch(actions.updateRole(formData));
    } else {
      dispatch(actions.createRole(formData));
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("確定要刪除此角色嗎？")) {
      return;
    }
    dispatch(actions.deleteRole(id));
  };

  // Permissions management
  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionsOpen(true);
    dispatch(actions.setSelectedRole(role));

    // Load powers and menus if not already loaded
    if (allPowers.length === 0 || menus.length === 0) {
      dispatch(actions.fetchPowersAndMenus());
    }

    // Load role's current powers
    dispatch(actions.fetchRolePowers(role.id));
  };

  const handleClosePermissions = () => {
    setPermissionsOpen(false);
    setSelectedRole(null);
    dispatch(actions.setSelectedRole(null));
    dispatch(actions.clearSelectedPowerIds());
  };

  const handleTogglePower = (powerId: number) => {
    dispatch(actions.togglePower(powerId));
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    dispatch(
      actions.assignPowers({
        roleId: selectedRole.id,
        powerIds: selectedPowerIds,
      })
    );
    handleClosePermissions();
  };

  const handleCloseSnackbar = () => {
    dispatch(actions.closeSnackbar());
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
        <Typography variant="h4">角色管理</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          新增角色
        </Button>
      </Box>

      {loading && roles.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>角色名稱</TableCell>
                <TableCell>描述</TableCell>
                <TableCell>排序</TableCell>
                <TableCell>啟用</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.title}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.sort}</TableCell>
                  <TableCell>
                    <Switch checked={role.is_enable} disabled />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleOpenPermissions(role)}
                      title="權限設定"
                    >
                      <Security />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(role)}
                      title="編輯"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(role.id)}
                      title="刪除"
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

      {/* Role Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? "編輯角色" : "新增角色"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="角色名稱"
              fullWidth
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <TextField
              label="描述"
              fullWidth
              multiline
              rows={3}
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

      {/* Permissions Dialog */}
      <Dialog
        open={permissionsOpen}
        onClose={handleClosePermissions}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>權限設定 - {selectedRole?.title}</DialogTitle>
        <DialogContent>
          {loadingPermissions ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : allPowers.length === 0 ? (
            <Alert severity="warning">
              暫無權限數據，請先在「權限管理」頁面創建權限。
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                已選擇 {selectedPowerIds.length} 個權限
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(groupedPowers).map(([menuName, powers]) => (
                  <Paper key={menuName} sx={{ p: 2, backgroundColor: "#f8f9fa" }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "primary.main" }}
                    >
                      {menuName}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <FormGroup>
                      {powers.map((power) => (
                        <FormControlLabel
                          key={power.id}
                          control={
                            <Checkbox
                              checked={selectedPowerIds.includes(power.id)}
                              onChange={() => handleTogglePower(power.id)}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1">{power.title}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                component="div"
                              >
                                代碼: <code>{power.code}</code>
                                {power.description && ` - ${power.description}`}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissions}>取消</Button>
          <Button
            onClick={handleSavePermissions}
            variant="contained"
            disabled={savingPermissions || loadingPermissions}
          >
            {savingPermissions ? <CircularProgress size={20} /> : "保存"}
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

export default RoleManagement;

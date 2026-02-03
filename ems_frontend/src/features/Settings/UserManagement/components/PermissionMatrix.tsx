import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Chip,
  Tooltip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { fetchRoles, fetchRolePowers, assignPowers, type Role } from "../../../../api/role";
import { fetchPowers, type Power } from "../../../../api/power";
import { fetchMenus, type MenuItem } from "../../../../api/menu";

interface GroupedPowers {
  menuName: string;
  menuId: number;
  powers: Power[];
}

const PermissionMatrix: React.FC = () => {
  // 數據狀態
  const [roles, setRoles] = useState<Role[]>([]);
  const [powers, setPowers] = useState<Power[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);

  // 權限矩陣狀態: { roleId: { powerId: boolean } }
  const [matrix, setMatrix] = useState<Record<number, Record<number, boolean>>>({});
  const [originalMatrix, setOriginalMatrix] = useState<Record<number, Record<number, boolean>>>({});

  // UI 狀態
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // 載入所有數據
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 並行載入角色、權限、菜單
      const [rolesRes, powersRes, menusRes] = await Promise.all([
        fetchRoles(),
        fetchPowers(),
        fetchMenus(),
      ]);

      if (!rolesRes.success || !Array.isArray(rolesRes.data)) {
        throw new Error("載入角色失敗");
      }
      if (!powersRes.success || !Array.isArray(powersRes.data)) {
        throw new Error("載入權限失敗");
      }
      if (!menusRes.success || !Array.isArray(menusRes.data)) {
        throw new Error("載入菜單失敗");
      }

      const rolesData = rolesRes.data as Role[];
      const powersData = powersRes.data as Power[];
      const menusData = menusRes.data as MenuItem[];

      setRoles(rolesData);
      setPowers(powersData);
      setMenus(menusData);

      // 並行載入所有角色的權限
      const rolePowersPromises = rolesData.map((role) =>
        fetchRolePowers(role.id).then((res) => ({
          roleId: role.id,
          powerIds: res.success && Array.isArray(res.data)
            ? (res.data as Power[]).map((p) => p.id)
            : [],
        }))
      );

      const allRolePowers = await Promise.all(rolePowersPromises);

      // 建立權限矩陣
      const newMatrix: Record<number, Record<number, boolean>> = {};
      rolesData.forEach((role) => {
        newMatrix[role.id] = {};
        powersData.forEach((power) => {
          newMatrix[role.id][power.id] = false;
        });
      });

      // 填入現有權限
      allRolePowers.forEach(({ roleId, powerIds }) => {
        powerIds.forEach((powerId) => {
          if (newMatrix[roleId]) {
            newMatrix[roleId][powerId] = true;
          }
        });
      });

      setMatrix(newMatrix);
      setOriginalMatrix(JSON.parse(JSON.stringify(newMatrix)));
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "載入數據失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 切換權限
  const handleToggle = (roleId: number, powerId: number) => {
    setMatrix((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [powerId]: !prev[roleId]?.[powerId],
      },
    }));
  };

  // 檢查是否有變更
  const hasChanges = useCallback(() => {
    return JSON.stringify(matrix) !== JSON.stringify(originalMatrix);
  }, [matrix, originalMatrix]);

  // 獲取變更的角色
  const getChangedRoles = useCallback(() => {
    const changedRoleIds: number[] = [];
    roles.forEach((role) => {
      const original = originalMatrix[role.id] || {};
      const current = matrix[role.id] || {};
      const allPowerIds = new Set([...Object.keys(original), ...Object.keys(current)]);

      for (const powerId of allPowerIds) {
        if (original[Number(powerId)] !== current[Number(powerId)]) {
          changedRoleIds.push(role.id);
          break;
        }
      }
    });
    return changedRoleIds;
  }, [roles, matrix, originalMatrix]);

  // 保存所有變更
  const handleSaveAll = async () => {
    const changedRoleIds = getChangedRoles();
    if (changedRoleIds.length === 0) {
      setSnackbar({ open: true, message: "沒有需要保存的變更", severity: "success" });
      return;
    }

    setSaving(true);

    try {
      // 並行保存所有變更的角色
      const savePromises = changedRoleIds.map((roleId) => {
        const powerIds = Object.entries(matrix[roleId] || {})
          .filter(([, checked]) => checked)
          .map(([powerId]) => Number(powerId));
        return assignPowers(roleId, { power_ids: powerIds });
      });

      await Promise.all(savePromises);

      // 更新原始矩陣
      setOriginalMatrix(JSON.parse(JSON.stringify(matrix)));
      setSnackbar({ open: true, message: `成功保存 ${changedRoleIds.length} 個角色的權限`, severity: "success" });
    } catch (err) {
      console.error("Failed to save:", err);
      setSnackbar({ open: true, message: "保存失敗", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 按菜單分組權限
  const getGroupedPowers = (): GroupedPowers[] => {
    const grouped: Record<number, GroupedPowers> = {};

    powers.forEach((power) => {
      if (!grouped[power.menu_id]) {
        const menu = menus.find((m) => m.id === power.menu_id);
        grouped[power.menu_id] = {
          menuId: power.menu_id,
          menuName: menu?.title || `菜單 ${power.menu_id}`,
          powers: [],
        };
      }
      grouped[power.menu_id].powers.push(power);
    });

    return Object.values(grouped).sort((a, b) => a.menuId - b.menuId);
  };

  // 計算角色的權限數量
  const getRolePowerCount = (roleId: number): number => {
    return Object.values(matrix[roleId] || {}).filter(Boolean).length;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>載入權限數據中...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={loadAllData} sx={{ ml: 2 }}>
          重試
        </Button>
      </Alert>
    );
  }

  if (roles.length === 0 || powers.length === 0) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {roles.length === 0 ? "暫無角色數據，請先創建角色。" : "暫無權限數據，請先在「權限管理」頁面創建權限。"}
      </Alert>
    );
  }

  const groupedPowers = getGroupedPowers();
  const changedRolesCount = getChangedRoles().length;

  return (
    <Box sx={{ p: 2 }}>
      {/* 頂部工具欄 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h6">權限矩陣</Typography>
          <Typography variant="body2" color="text.secondary">
            直接勾選設置角色權限，完成後點擊「保存所有變更」
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {changedRolesCount > 0 && (
            <Chip
              label={`${changedRolesCount} 個角色有變更`}
              color="warning"
              size="small"
            />
          )}
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveAll}
            disabled={saving || !hasChanges()}
          >
            保存所有變更
          </Button>
        </Box>
      </Box>

      {/* 權限矩陣表 */}
      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 300px)" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  minWidth: 200,
                  position: "sticky",
                  left: 0,
                  backgroundColor: "background.paper",
                  zIndex: 3,
                }}
              >
                權限 / 角色
              </TableCell>
              {roles.map((role) => (
                <TableCell
                  key={role.id}
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    minWidth: 100,
                    backgroundColor: "background.paper",
                  }}
                >
                  <Tooltip title={role.description || role.title}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {role.title}
                      </Typography>
                      <Chip
                        label={`${getRolePowerCount(role.id)}/${powers.length}`}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedPowers.map((group) => (
              <React.Fragment key={group.menuId}>
                {/* 菜單分組標題行 */}
                <TableRow>
                  <TableCell
                    colSpan={roles.length + 1}
                    sx={{
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: "bold",
                      position: "sticky",
                      left: 0,
                    }}
                  >
                    {group.menuName}
                  </TableCell>
                </TableRow>
                {/* 該菜單下的權限行 */}
                {group.powers.map((power) => (
                  <TableRow key={power.id} hover>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: "background.paper",
                        zIndex: 1,
                      }}
                    >
                      <Tooltip title={power.description || power.code}>
                        <Box>
                          <Typography variant="body2">{power.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {power.code}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} align="center" padding="checkbox">
                        <Checkbox
                          checked={matrix[role.id]?.[power.id] || false}
                          onChange={() => handleToggle(role.id, power.id)}
                          size="small"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default PermissionMatrix;

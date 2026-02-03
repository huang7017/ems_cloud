import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  ExpandMore,
  ChevronRight,
  Business,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import {
  fetchSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  syncSchedule,
  queryScheduleFromDevice,
  clearSchedule,
  closeSnackbar,
} from "./reducer";
import {
  selectSchedule,
  selectLoading,
  selectSaving,
  selectSyncing,
  selectSnackbar,
} from "./selector";
import {
  scheduleToFormData,
  formDataToRequest,
  createEmptyScheduleForm,
  type ScheduleFormData,
} from "./types";
import { SYNC_STATUS_LABELS } from "../../../api/schedule";
import DailyRuleEditor from "./components/DailyRuleEditor";
import ExceptionsEditor from "./components/ExceptionsEditor";
import {
  fetchCompanies,
  fetchCompanyDevices,
  clearCompanyDevices,
} from "../CompanyManagement/reducer";
import {
  selectCompanies,
  selectCompanyDevices,
  selectLoading as selectCompanyLoading,
  selectLoadingDevices,
} from "../CompanyManagement/selector";

const ScheduleManagement: React.FC = () => {
  const dispatch = useDispatch();
  const schedule = useSelector(selectSchedule);
  const loading = useSelector(selectLoading);
  const saving = useSelector(selectSaving);
  const syncing = useSelector(selectSyncing);
  const snackbar = useSelector(selectSnackbar);
  const companies = useSelector(selectCompanies);
  const companyLoading = useSelector(selectCompanyLoading);
  const companyDevices = useSelector(selectCompanyDevices);
  const loadingDevices = useSelector(selectLoadingDevices);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | "">("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | "">("");
  const [formData, setFormData] = useState<ScheduleFormData>(createEmptyScheduleForm());
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<number>>(new Set());

  // 獲取公司列表
  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // 當選擇公司時獲取設備列表
  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(fetchCompanyDevices(selectedCompanyId as number));
    } else {
      dispatch(clearCompanyDevices());
    }
  }, [dispatch, selectedCompanyId]);

  // 當選擇設備時獲取排程
  useEffect(() => {
    if (selectedDeviceId) {
      dispatch(fetchSchedule(selectedDeviceId as number));
    } else {
      dispatch(clearSchedule());
    }
  }, [dispatch, selectedDeviceId]);

  // 當排程載入時更新表單
  useEffect(() => {
    setFormData(scheduleToFormData(schedule));
    setHasChanges(false);
  }, [schedule]);

  // 展開/收合公司
  const handleToggleCompanyExpand = (companyId: number) => {
    const newExpanded = new Set(expandedCompanyIds);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanyIds(newExpanded);
  };

  // 處理公司選擇
  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setSelectedDeviceId("");
    dispatch(clearSchedule());
  };

  // 處理公司選擇（舊接口，保持兼容）
  const handleCompanyChange = (companyId: number | "") => {
    if (companyId === "") {
      setSelectedCompanyId("");
    } else {
      handleCompanySelect(companyId as number);
    }
    setSelectedDeviceId("");
    dispatch(clearSchedule());
  };

  // 處理設備選擇
  const handleDeviceChange = (deviceId: number | "") => {
    setSelectedDeviceId(deviceId);
  };

  // 更新表單資料
  const handleFormChange = useCallback((newFormData: ScheduleFormData) => {
    setFormData(newFormData);
    setHasChanges(true);
  }, []);

  // 儲存排程
  const handleSave = () => {
    if (!selectedDeviceId) return;

    const request = formDataToRequest(formData, selectedDeviceId as number);

    if (schedule) {
      dispatch(updateSchedule({ companyDeviceId: selectedDeviceId as number, data: request }));
    } else {
      dispatch(createSchedule(request));
    }
    setHasChanges(false);
  };

  // 刪除排程
  const handleDelete = () => {
    if (!selectedDeviceId || !schedule) return;
    if (window.confirm("確定要刪除此排程嗎？")) {
      dispatch(deleteSchedule(selectedDeviceId as number));
    }
  };

  // 同步排程
  const handleSync = () => {
    if (!selectedDeviceId) return;
    dispatch(syncSchedule(selectedDeviceId as number));
  };

  // 從設備獲取排程
  const handleQueryFromDevice = () => {
    if (!selectedDeviceId) return;
    dispatch(queryScheduleFromDevice(selectedDeviceId as number));
  };

  // 關閉 Snackbar
  const handleCloseSnackbar = () => {
    dispatch(closeSnackbar());
  };

  // 獲取選中的公司名稱
  const getSelectedCompanyName = (): string => {
    if (!selectedCompanyId) return "";
    const findCompany = (companyList: typeof companies): typeof companies[0] | null => {
      for (const company of companyList) {
        if (company.id === selectedCompanyId) return company;
        if (company.children) {
          const found = findCompany(company.children);
          if (found) return found;
        }
      }
      return null;
    };
    const company = findCompany(companies);
    return company?.name || "";
  };

  // 渲染公司樹
  const renderCompanyTree = (companyList: typeof companies, level = 0) => {
    return companyList.map((company) => {
      const hasChildren = company.children && company.children.length > 0;
      const isExpanded = expandedCompanyIds.has(company.id);
      const isSelected = selectedCompanyId === company.id;

      return (
        <React.Fragment key={company.id}>
          <ListItem disablePadding sx={{ pl: level * 2 }}>
            <ListItemButton
              selected={isSelected}
              onClick={() => handleCompanySelect(company.id)}
              sx={{ py: 0.5 }}
            >
              {hasChildren ? (
                <ListItemIcon
                  sx={{ minWidth: 28, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCompanyExpand(company.id);
                  }}
                >
                  {isExpanded ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                </ListItemIcon>
              ) : (
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <Business fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText
                primary={company.name}
                primaryTypographyProps={{ variant: "body2" }}
              />
              {!company.is_active && (
                <Chip label="停用" size="small" color="warning" sx={{ ml: 1, height: 20, fontSize: "0.7rem" }} />
              )}
            </ListItemButton>
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {renderCompanyTree(company.children!, level + 1)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        排程管理
      </Typography>

      {/* 主要內容區：左側公司樹 + 右側排程編輯 */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* 左側：公司樹狀選擇器 */}
        <Paper sx={{ width: 280, minHeight: 400, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ p: 2, borderBottom: 1, borderColor: "divider", fontWeight: "medium" }}>
            選擇公司
          </Typography>
          {companyLoading && companies.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : companies.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
              暫無公司數據
            </Typography>
          ) : (
            <List sx={{ maxHeight: 350, overflow: "auto" }} dense>
              {renderCompanyTree(companies)}
            </List>
          )}
        </Paper>

        {/* 右側：設備選擇和排程編輯 */}
        <Box sx={{ flex: 1 }}>
          {/* 選擇設備 */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {selectedCompanyId ? (
                <Chip
                  label={getSelectedCompanyName()}
                  onDelete={() => handleCompanyChange("")}
                  color="primary"
                  variant="outlined"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  請在左側選擇公司
                </Typography>
              )}

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>選擇設備</InputLabel>
                <Select
                  value={selectedDeviceId}
                  label="選擇設備"
                  onChange={(e) => handleDeviceChange(e.target.value as number | "")}
                  disabled={!selectedCompanyId || loadingDevices}
                >
                  <MenuItem value="">
                    <em>請選擇</em>
                  </MenuItem>
                  {companyDevices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      設備 {device.device_sn || `#${device.device_id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {loadingDevices && <CircularProgress size={20} />}

              {schedule && (
                <Chip
                  label={SYNC_STATUS_LABELS[schedule.sync_status] || schedule.sync_status}
                  color={
                    schedule.sync_status === "synced"
                      ? "success"
                      : schedule.sync_status === "failed"
                      ? "error"
                      : "warning"
                  }
                  size="small"
                />
              )}
            </Stack>
          </Paper>

          {/* 載入中 */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 排程編輯區 */}
          {!loading && selectedDeviceId && (
            <>
              {/* 每日規則編輯器 */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  每日排程規則
                </Typography>
                <DailyRuleEditor
                  formData={formData}
                  onChange={handleFormChange}
                />
              </Paper>

              {/* 例外日期編輯器 */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  例外日期 (跳過排程)
                </Typography>
                <ExceptionsEditor
                  exceptions={formData.exceptions}
                  onChange={(exceptions) =>
                    handleFormChange({ ...formData, exceptions })
                  }
                />
              </Paper>

              {/* 操作按鈕 */}
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {schedule ? "更新排程" : "創建排程"}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={syncing ? <CircularProgress size={20} /> : <CloudDownloadIcon />}
                  onClick={handleQueryFromDevice}
                  disabled={syncing}
                >
                  從設備獲取排程
                </Button>

                {schedule && (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
                      onClick={handleSync}
                      disabled={syncing || schedule.sync_status === "synced"}
                    >
                      同步到設備
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      刪除排程
                    </Button>
                  </>
                )}
              </Stack>
            </>
          )}

          {/* 未選擇設備提示 */}
          {!loading && !selectedDeviceId && (
            <Alert severity="info">
              {!selectedCompanyId
                ? "請先在左側選擇公司"
                : "請選擇設備以管理排程"}
            </Alert>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleManagement;

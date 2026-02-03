import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDeviceSSE } from "../../../hooks/useDeviceSSE";
import {
  Box,
  Paper,
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Business,
  ExpandMore,
  ChevronRight,
  People,
  Devices,
  PersonAdd,
  Sync,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Schedule,
  Map,
  AcUnit,
  AddCircle,
} from "@mui/icons-material";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchCompanyMembers,
  fetchCompanyDevices,
  removeCompanyMember,
  removeDevice,
  createCompanyManager,
  createCompanyUser,
  setSelectedCompany,
  closeSnackbar,
  clearCompanyMembers,
  clearCompanyDevices,
  fetchAvailableDevices,
  assignDevice,
} from "./reducer";
import {
  selectCompanies,
  selectSelectedCompany,
  selectCompanyMembers,
  selectCompanyDevices,
  selectLoading,
  selectLoadingMembers,
  selectLoadingDevices,
  selectSnackbar,
  selectFlatCompanies,
  selectUnassignedDevices,
} from "./selector";
import type { Company, CompanyRequest, CreateManagerRequest } from "./types";
import Cookies from "js-cookie";
import axios from "axios";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const CompanyManagement: React.FC = () => {
  const dispatch = useDispatch();

  // Redux state
  const companies = useSelector(selectCompanies);
  const flatCompanies = useSelector(selectFlatCompanies);
  const selectedCompany = useSelector(selectSelectedCompany);
  const companyMembers = useSelector(selectCompanyMembers);
  const companyDevices = useSelector(selectCompanyDevices);
  const loading = useSelector(selectLoading);
  const loadingMembers = useSelector(selectLoadingMembers);
  const loadingDevices = useSelector(selectLoadingDevices);
  const snackbar = useSelector(selectSnackbar);
  const unassignedDevices = useSelector(selectUnassignedDevices);

  // Check if user is SystemAdmin
  const roleId = Cookies.get("roleId");
  const isSystemAdmin = roleId === "1";

  // Local state
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyFormData, setCompanyFormData] = useState<CompanyRequest>({
    name: "",
    address: "",
    contact_person: "",
    contact_phone: "",
    parent_id: null,
    is_active: true,
  });
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [tabValue, setTabValue] = useState(0);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<CreateManagerRequest>({
    name: "",
    email: "",
    password: "",
  });
  const [createUserType, setCreateUserType] = useState<"manager" | "user">(
    "manager"
  );
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Set<number>>(new Set());
  const [syncingDeviceId, setSyncingDeviceId] = useState<number | null>(null);
  const [assignDeviceDialogOpen, setAssignDeviceDialogOpen] = useState(false);
  const [selectedDeviceToAssign, setSelectedDeviceToAssign] = useState<number | "">("");
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  // SSE callback to handle device updates
  const handleDeviceUpdate = useCallback(
    (event: { device_sn: string; company_id: number; device_id: number; updated_at: string }) => {
      // If the update is for the currently selected company, refresh devices
      if (selectedCompany && event.company_id === selectedCompany.id) {
        dispatch(fetchCompanyDevices(selectedCompany.id));
        setLastUpdateTime(new Date().toLocaleTimeString());
      }
    },
    [dispatch, selectedCompany]
  );

  // Connect to SSE for real-time device updates
  useDeviceSSE({
    companyId: selectedCompany?.id,
    onDeviceUpdate: handleDeviceUpdate,
    enabled: !!selectedCompany,
  });

  // Load companies on mount
  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // Load members and devices when a company is selected
  useEffect(() => {
    if (selectedCompany) {
      dispatch(fetchCompanyMembers(selectedCompany.id));
      dispatch(fetchCompanyDevices(selectedCompany.id));
      setLastUpdateTime(null); // Clear update indicator when switching companies
    } else {
      dispatch(clearCompanyMembers());
      dispatch(clearCompanyDevices());
    }
  }, [dispatch, selectedCompany]);

  // Available parent companies for dropdown
  const availableParentCompanies = useMemo(() => {
    if (!editingCompany) return flatCompanies;
    // Exclude the editing company and its descendants
    const getDescendantIds = (company: Company): Set<number> => {
      const ids = new Set<number>([company.id]);
      if (company.children) {
        company.children.forEach((child) => {
          const childIds = getDescendantIds(child);
          childIds.forEach((id) => ids.add(id));
        });
      }
      return ids;
    };
    const excludeIds = getDescendantIds(editingCompany);
    return flatCompanies.filter((c) => !excludeIds.has(c.id));
  }, [flatCompanies, editingCompany]);

  const handleToggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleSelectCompany = (company: Company) => {
    dispatch(setSelectedCompany(company));
  };

  const handleOpenCompanyDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setCompanyFormData({
        name: company.name,
        address: company.address || "",
        contact_person: company.contact_person || "",
        contact_phone: company.contact_phone || "",
        parent_id: company.parent_id,
        is_active: company.is_active,
      });
    } else {
      setEditingCompany(null);
      setCompanyFormData({
        name: "",
        address: "",
        contact_person: "",
        contact_phone: "",
        parent_id: null,
        is_active: true,
      });
    }
    setCompanyDialogOpen(true);
  };

  const handleCloseCompanyDialog = () => {
    setCompanyDialogOpen(false);
    setEditingCompany(null);
  };

  const handleSubmitCompany = () => {
    if (!companyFormData.name.trim()) return;

    if (editingCompany) {
      dispatch(
        updateCompany({ id: editingCompany.id, data: companyFormData })
      );
    } else {
      dispatch(createCompany(companyFormData));
    }
    handleCloseCompanyDialog();
  };

  const handleDeleteCompany = (id: number) => {
    if (!window.confirm("確定要刪除此公司嗎？此操作無法復原。")) return;
    dispatch(deleteCompany(id));
    if (selectedCompany?.id === id) {
      dispatch(setSelectedCompany(null));
    }
  };

  const handleOpenCreateUserDialog = (type: "manager" | "user") => {
    setCreateUserType(type);
    setUserFormData({ name: "", email: "", password: "" });
    setCreateUserDialogOpen(true);
  };

  const handleCloseCreateUserDialog = () => {
    setCreateUserDialogOpen(false);
  };

  const handleSubmitCreateUser = () => {
    if (
      !selectedCompany ||
      !userFormData.name.trim() ||
      !userFormData.email.trim() ||
      !userFormData.password.trim()
    )
      return;

    if (createUserType === "manager") {
      dispatch(
        createCompanyManager({
          companyId: selectedCompany.id,
          data: userFormData,
        })
      );
    } else {
      dispatch(
        createCompanyUser({
          companyId: selectedCompany.id,
          data: userFormData,
        })
      );
    }
    handleCloseCreateUserDialog();
  };

  const handleRemoveMember = (memberId: number) => {
    if (!selectedCompany) return;
    if (!window.confirm("確定要將此成員從公司移除嗎？")) return;
    dispatch(
      removeCompanyMember({ companyId: selectedCompany.id, memberId })
    );
  };

  const handleRemoveDevice = (deviceId: number) => {
    if (!selectedCompany) return;
    if (!window.confirm("確定要將此設備從公司移除嗎？")) return;
    dispatch(removeDevice({ companyId: selectedCompany.id, deviceId }));
  };

  // Open assign device dialog
  const handleOpenAssignDeviceDialog = () => {
    dispatch(fetchAvailableDevices());
    setSelectedDeviceToAssign("");
    setAssignDeviceDialogOpen(true);
  };

  const handleCloseAssignDeviceDialog = () => {
    setAssignDeviceDialogOpen(false);
    setSelectedDeviceToAssign("");
  };

  const handleAssignDevice = () => {
    if (!selectedCompany || !selectedDeviceToAssign) return;
    dispatch(
      assignDevice({
        companyId: selectedCompany.id,
        deviceId: selectedDeviceToAssign as number,
      })
    );
    handleCloseAssignDeviceDialog();
  };

  const handleToggleDeviceExpand = (deviceId: number) => {
    const newExpanded = new Set(expandedDeviceIds);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDeviceIds(newExpanded);
  };

  const handleSyncSchedule = async (companyId: number, deviceId: number, companyDeviceId: number) => {
    setSyncingDeviceId(companyDeviceId);
    try {
      await axios.post(`/companies/${companyId}/devices/${deviceId}/sync`);
      alert("排程同步成功！");
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || "未知錯誤";
      alert(`同步失敗: ${message}`);
    } finally {
      setSyncingDeviceId(null);
    }
  };

  const handleQueryDeviceInfo = async (companyId: number, deviceId: number, companyDeviceId: number) => {
    setSyncingDeviceId(companyDeviceId);
    try {
      await axios.post(`/companies/${companyId}/devices/${deviceId}/info`);
      // Data will auto-refresh via SSE when device responds
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || "未知錯誤";
      alert(`查詢失敗: ${message}`);
    } finally {
      setSyncingDeviceId(null);
    }
  };

  // Helper: Find AC device by ID
  // For VRF type, ac_id points to the individual AC unit inside vrfs[].acs[]
  // For Package type, ac_id points to the package in packages[]
  const findACDevice = (content: any, acId: string, type: number | string) => {
    const isVRF = type === 0 || type === "vrf";
    const isPackage = type === 1 || type === "package";

    if (isPackage) {
      // Package AC - find in packages array
      return { type: "package", device: content.packages?.find((p: any) => p.id === acId) };
    } else if (isVRF) {
      // VRF - ac_id points to individual AC unit inside vrfs[].acs[]
      for (const vrf of content.vrfs || []) {
        // Check both 'acs' and 'ac_units' fields for compatibility
        const units = vrf.acs || vrf.ac_units || [];
        const unit = units.find((u: any) => u.id === acId);
        if (unit) {
          return { type: "vrf_unit", device: unit, vrf };
        }
      }
      // Also check if ac_id matches VRF id directly (for different data formats)
      const vrfDirect = content.vrfs?.find((v: any) => v.id === acId);
      if (vrfDirect) {
        return { type: "vrf", device: vrfDirect };
      }
    }
    return null;
  };

  // Render Package AC card
  const renderPackageCard = (pkg: any, compact = false) => {
    const runningCompressors = pkg.compressors?.filter((c: any) => c.run_status).length || 0;
    const totalCompressors = pkg.compressors?.length || 0;
    const hasError = pkg.compressors?.some((c: any) => c.error_status);

    return (
      <Box sx={{ p: compact ? 1 : 1.5, bgcolor: "#f0fdf4", borderRadius: 1, border: "1px solid #bbf7d0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: compact ? 0.5 : 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534", fontSize: compact ? "0.8rem" : undefined }}>
            ❄️ {pkg.name || pkg.id}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {hasError && (
              <Chip label="異常" size="small" color="error" sx={{ height: 18, fontSize: "0.65rem" }} />
            )}
            <Chip
              label={`${runningCompressors}/${totalCompressors}`}
              size="small"
              color={runningCompressors > 0 ? "success" : "default"}
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          </Box>
        </Box>
        {!compact && pkg.compressors && pkg.compressors.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {pkg.compressors.map((comp: any, compIdx: number) => (
              <Chip
                key={compIdx}
                size="small"
                label={`壓縮機 ${comp.address || compIdx + 1}`}
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  bgcolor: comp.error_status ? "#fee2e2" : comp.run_status ? "#dcfce7" : "#f3f4f6",
                  color: comp.error_status ? "#991b1b" : comp.run_status ? "#166534" : "#6b7280",
                  border: "1px solid",
                  borderColor: comp.error_status ? "#fecaca" : comp.run_status ? "#86efac" : "#e5e7eb",
                  "& .MuiChip-label": { px: 1 }
                }}
                icon={
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: comp.error_status ? "#ef4444" : comp.run_status ? "#22c55e" : "#9ca3af",
                      ml: 0.5
                    }}
                  />
                }
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  // Helper: Check if VRF unit is running (handles both status formats)
  const isUnitRunning = (unit: any) => {
    if (typeof unit.status === 'object') {
      return unit.status?.power_on === true;
    }
    return unit.status === 1;
  };

  // Render single VRF AC Unit card
  const renderVRFUnitCard = (unit: any, vrfAddress?: string) => {
    const isRunning = isUnitRunning(unit);
    return (
      <Box sx={{ p: 1, bgcolor: "#f0f4ff", borderRadius: 1, border: "1px solid #dbeafe" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", fontSize: "0.8rem" }}>
            🏢 {unit.name || `AC #${unit.number}`}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: isRunning ? "#22c55e" : "#9ca3af",
              }}
            />
            <Typography variant="caption" color={isRunning ? "success.main" : "text.secondary"}>
              {isRunning ? "運行" : "關閉"}
            </Typography>
          </Box>
        </Box>
        {unit.location && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
            位置: {unit.location} {vrfAddress && `| VRF: ${vrfAddress}`}
          </Typography>
        )}
      </Box>
    );
  };

  // Render VRF card (entire VRF system)
  const renderVRFCard = (vrf: any, compact = false) => {
    const units = vrf.acs || vrf.ac_units || [];
    const runningUnits = units.filter((u: any) => isUnitRunning(u)).length;
    const totalUnits = units.length;

    return (
      <Box sx={{ p: compact ? 1 : 1.5, bgcolor: "#f0f4ff", borderRadius: 1, border: "1px solid #dbeafe" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: compact ? 0.5 : 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", fontSize: compact ? "0.8rem" : undefined }}>
            🏢 VRF {vrf.address || vrf.id}
          </Typography>
          <Chip
            label={`${runningUnits}/${totalUnits}`}
            size="small"
            color={runningUnits > 0 ? "primary" : "default"}
            sx={{ height: 18, fontSize: "0.65rem" }}
          />
        </Box>
        {!compact && units.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {units.map((unit: any, unitIdx: number) => {
              const isRunning = isUnitRunning(unit);
              return (
                <Chip
                  key={unitIdx}
                  size="small"
                  label={unit.name || `#${unit.number || unitIdx + 1}`}
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    bgcolor: isRunning ? "#dcfce7" : "#f3f4f6",
                    color: isRunning ? "#166534" : "#6b7280",
                    border: "1px solid",
                    borderColor: isRunning ? "#86efac" : "#e5e7eb",
                    "& .MuiChip-label": { px: 1 }
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: isRunning ? "#22c55e" : "#9ca3af",
                        ml: 0.5
                      }}
                    />
                  }
                />
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  // Render device content
  const renderDeviceContent = (content: any) => {
    if (!content) return <Typography color="text.secondary">無設備內容</Typography>;

    return (
      <Box sx={{ pl: 2, py: 1 }}>
        {/* Areas with AC mappings */}
        {content.areas && content.areas.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Map fontSize="small" color="primary" />
              區域與設備對應 ({content.areas.length} 區域)
            </Typography>
            <Box sx={{ pl: 1 }}>
              {content.areas.map((area: any, idx: number) => (
                <Box key={idx} sx={{ mb: 2, p: 1.5, bgcolor: "#fafafa", borderRadius: 1, border: "1px solid #e5e7eb" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                    📍 {area.name || area.id}
                    <Chip
                      label={`${area.ac_mappings?.length || 0} AC`}
                      size="small"
                      sx={{ height: 18, fontSize: "0.65rem", ml: 1 }}
                    />
                    {area.meter_mappings?.length > 0 && (
                      <Chip
                        label={`${area.meter_mappings.length} 電表`}
                        size="small"
                        color="warning"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                    )}
                  </Typography>
                  {/* AC Devices in this area */}
                  {area.ac_mappings && area.ac_mappings.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pl: 1 }}>
                      {area.ac_mappings.map((mapping: any, mapIdx: number) => {
                        const result = findACDevice(content, mapping.ac_id, mapping.type);
                        if (!result || !result.device) {
                          return (
                            <Typography key={mapIdx} variant="caption" color="text.secondary">
                              未找到 AC: {mapping.ac_id?.slice(0, 8)}...
                            </Typography>
                          );
                        }
                        return (
                          <Box key={mapIdx}>
                            {result.type === "package" && renderPackageCard(result.device, true)}
                            {result.type === "vrf" && renderVRFCard(result.device, true)}
                            {result.type === "vrf_unit" && renderVRFUnitCard(result.device, result.vrf?.address)}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                      此區域尚未綁定 AC 設備
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Unassigned Packages (not linked to any area) */}
        {content.packages && content.packages.length > 0 && (() => {
          const assignedPackageIds = new Set(
            content.areas?.flatMap((a: any) =>
              a.ac_mappings?.filter((m: any) => m.type === 1 || m.type === "package").map((m: any) => m.ac_id) || []
            ) || []
          );
          const unassignedPackages = content.packages.filter((p: any) => !assignedPackageIds.has(p.id));
          if (unassignedPackages.length === 0) return null;
          return (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AcUnit fontSize="small" color="info" />
                未分配區域的 Package AC ({unassignedPackages.length})
              </Typography>
              <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {unassignedPackages.map((pkg: any, idx: number) => (
                  <Box key={idx}>{renderPackageCard(pkg)}</Box>
                ))}
              </Box>
            </Box>
          );
        })()}

        {/* Unassigned VRF Units (not linked to any area) */}
        {content.vrfs && content.vrfs.length > 0 && (() => {
          // Collect all assigned AC unit IDs
          const assignedUnitIds = new Set(
            content.areas?.flatMap((a: any) =>
              a.ac_mappings?.filter((m: any) => m.type === 0 || m.type === "vrf").map((m: any) => m.ac_id) || []
            ) || []
          );

          // Find unassigned units across all VRFs
          const unassignedUnits: { unit: any; vrf: any }[] = [];
          for (const vrf of content.vrfs) {
            const units = vrf.acs || vrf.ac_units || [];
            for (const unit of units) {
              if (!assignedUnitIds.has(unit.id)) {
                unassignedUnits.push({ unit, vrf });
              }
            }
          }

          if (unassignedUnits.length === 0) return null;
          return (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AcUnit fontSize="small" color="secondary" />
                未分配區域的 VRF 室內機 ({unassignedUnits.length})
              </Typography>
              <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {unassignedUnits.map(({ unit, vrf }, idx: number) => (
                  <Box key={idx}>{renderVRFUnitCard(unit, vrf.address)}</Box>
                ))}
              </Box>
            </Box>
          );
        })()}

        {/* Schedule */}
        {content.schedule && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Schedule fontSize="small" color="success" />
              排程設定
            </Typography>
            <Box sx={{ pl: 2 }}>
              {content.schedule.daily_rules && Object.keys(content.schedule.daily_rules).length > 0 ? (
                Object.entries(content.schedule.daily_rules).map(([day, rule]: [string, any]) => (
                  rule && (
                    <Chip
                      key={day}
                      label={`${day}${rule.run_period ? ` (${rule.run_period.start}-${rule.run_period.end})` : ""}`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  )
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">未設定排程</Typography>
              )}
              {content.schedule.exceptions && content.schedule.exceptions.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  例外日期: {content.schedule.exceptions.join(", ")}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Version info */}
        {(content.version || content.last_sync_at) && (
          <Typography variant="caption" color="text.secondary">
            版本: {content.version || "N/A"} | 最後同步: {content.last_sync_at || "從未"}
          </Typography>
        )}
      </Box>
    );
  };

  const handleCloseSnackbar = () => {
    dispatch(closeSnackbar());
  };

  // Recursive company tree renderer
  const renderCompanyTree = (companyList: Company[], level = 0) => {
    return companyList.map((company) => {
      const hasChildren = company.children && company.children.length > 0;
      const isExpanded = expandedIds.has(company.id);
      const isSelected = selectedCompany?.id === company.id;

      return (
        <React.Fragment key={company.id}>
          <ListItem disablePadding sx={{ pl: level * 2 }}>
            <ListItemButton
              selected={isSelected}
              onClick={() => handleSelectCompany(company)}
            >
              {hasChildren ? (
                <ListItemIcon
                  sx={{ minWidth: 32, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(company.id);
                  }}
                >
                  {isExpanded ? <ExpandMore /> : <ChevronRight />}
                </ListItemIcon>
              ) : (
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Business fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText
                primary={company.name}
                secondary={company.contact_person || undefined}
              />
              {!company.is_active && (
                <Chip label="停用" size="small" color="warning" sx={{ mr: 1 }} />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCompanyDialog(company);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
              {isSystemAdmin && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCompany(company.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
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
          <Typography
            variant="h4"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Business color="primary" />
            公司管理
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            管理公司、成員和設備關聯
          </Typography>
        </Box>
        {isSystemAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCompanyDialog()}
          >
            新增公司
          </Button>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Company Tree */}
        <Paper sx={{ width: 350, minHeight: 400, overflow: "auto" }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            公司列表
            <Chip label={flatCompanies.length} size="small" sx={{ ml: 1 }} />
          </Typography>
          {loading && companies.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : companies.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 4, textAlign: "center" }}>
              暫無公司數據
            </Typography>
          ) : (
            <List>{renderCompanyTree(companies)}</List>
          )}
        </Paper>

        {/* Company Details */}
        <Paper sx={{ flex: 1, minHeight: 400 }}>
          {selectedCompany ? (
            <>
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6">{selectedCompany.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCompany.address || "未設定地址"}
                  </Typography>
                </Box>
                <Box>
                  {isSystemAdmin && (
                    <Button
                      size="small"
                      startIcon={<PersonAdd />}
                      onClick={() => handleOpenCreateUserDialog("manager")}
                      sx={{ mr: 1 }}
                    >
                      新增管理員
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpenCreateUserDialog("user")}
                  >
                    新增用戶
                  </Button>
                </Box>
              </Box>

              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <Tab icon={<People />} label="成員" iconPosition="start" />
                <Tab icon={<Devices />} label="設備" iconPosition="start" />
              </Tabs>

              {/* Members Tab */}
              <TabPanel value={tabValue} index={0}>
                {loadingMembers ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : companyMembers.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    此公司暫無成員
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>姓名</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>角色</TableCell>
                          <TableCell align="right">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companyMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                              <Chip label={member.role || "未分配"} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveMember(member.member_id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* Devices Tab */}
              <TabPanel value={tabValue} index={1}>
                {/* Add Device Button and Update Indicator */}
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    {lastUpdateTime && (
                      <Chip
                        icon={<Sync fontSize="small" />}
                        label={`資料已更新: ${lastUpdateTime}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        onDelete={() => setLastUpdateTime(null)}
                      />
                    )}
                  </Box>
                  {isSystemAdmin && (
                    <Button
                      variant="outlined"
                      startIcon={<AddCircle />}
                      onClick={handleOpenAssignDeviceDialog}
                    >
                      綁定設備
                    </Button>
                  )}
                </Box>

                {loadingDevices ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : companyDevices.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    此公司暫無關聯設備
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={40}></TableCell>
                          <TableCell>設備 ID</TableCell>
                          <TableCell>SN 碼</TableCell>
                          <TableCell align="right">操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companyDevices.map((device) => {
                          const isExpanded = expandedDeviceIds.has(device.id);
                          const isSyncing = syncingDeviceId === device.id;
                          return (
                            <React.Fragment key={device.id}>
                              <TableRow
                                sx={{ "& > *": { borderBottom: isExpanded ? "unset" : undefined } }}
                              >
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleDeviceExpand(device.id)}
                                  >
                                    {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                  </IconButton>
                                </TableCell>
                                <TableCell>{device.device_id}</TableCell>
                                <TableCell>
                                  <Typography sx={{ fontFamily: "monospace" }}>
                                    {device.device_sn}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Button
                                    size="small"
                                    startIcon={isSyncing ? <CircularProgress size={16} /> : <Sync />}
                                    onClick={() => handleSyncSchedule(selectedCompany!.id, device.device_id, device.id)}
                                    disabled={isSyncing}
                                    sx={{ mr: 1 }}
                                  >
                                    同步排程
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleQueryDeviceInfo(selectedCompany!.id, device.device_id, device.id)}
                                    disabled={isSyncing}
                                    sx={{ mr: 1 }}
                                  >
                                    查詢設備
                                  </Button>
                                  {isSystemAdmin && (
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveDevice(device.device_id)}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ py: 2, px: 1, bgcolor: "grey.50", borderRadius: 1, my: 1 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        設備內容
                                      </Typography>
                                      {renderDeviceContent(device.content)}
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 300,
                color: "text.secondary",
              }}
            >
              <Business sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography>請選擇一個公司查看詳情</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Company Dialog */}
      <Dialog
        open={companyDialogOpen}
        onClose={handleCloseCompanyDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCompany ? "編輯公司" : "新增公司"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="公司名稱"
              required
              fullWidth
              value={companyFormData.name}
              onChange={(e) =>
                setCompanyFormData({ ...companyFormData, name: e.target.value })
              }
            />
            <TextField
              label="地址"
              fullWidth
              value={companyFormData.address}
              onChange={(e) =>
                setCompanyFormData({ ...companyFormData, address: e.target.value })
              }
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="聯絡人"
                fullWidth
                value={companyFormData.contact_person}
                onChange={(e) =>
                  setCompanyFormData({
                    ...companyFormData,
                    contact_person: e.target.value,
                  })
                }
              />
              <TextField
                label="聯絡電話"
                fullWidth
                value={companyFormData.contact_phone}
                onChange={(e) =>
                  setCompanyFormData({
                    ...companyFormData,
                    contact_phone: e.target.value,
                  })
                }
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>上層公司</InputLabel>
              <Select
                value={companyFormData.parent_id || ""}
                onChange={(e) =>
                  setCompanyFormData({
                    ...companyFormData,
                    parent_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                label="上層公司"
              >
                <MenuItem value="">
                  <em>無（頂層公司）</em>
                </MenuItem>
                {availableParentCompanies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editingCompany && (
              <FormControlLabel
                control={
                  <Switch
                    checked={companyFormData.is_active}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData,
                        is_active: e.target.checked,
                      })
                    }
                  />
                }
                label="啟用"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompanyDialog}>取消</Button>
          <Button
            onClick={handleSubmitCompany}
            variant="contained"
            disabled={loading || !companyFormData.name.trim()}
          >
            {loading ? <CircularProgress size={20} /> : "保存"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={createUserDialogOpen}
        onClose={handleCloseCreateUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {createUserType === "manager" ? "新增公司管理員" : "新增公司用戶"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="姓名"
              required
              fullWidth
              value={userFormData.name}
              onChange={(e) =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
            />
            <TextField
              label="Email"
              required
              fullWidth
              type="email"
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
            />
            <TextField
              label="密碼"
              required
              fullWidth
              type="password"
              value={userFormData.password}
              onChange={(e) =>
                setUserFormData({ ...userFormData, password: e.target.value })
              }
              helperText="密碼長度至少 6 個字元"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateUserDialog}>取消</Button>
          <Button
            onClick={handleSubmitCreateUser}
            variant="contained"
            disabled={
              loading ||
              !userFormData.name.trim() ||
              !userFormData.email.trim() ||
              !userFormData.password.trim()
            }
          >
            {loading ? <CircularProgress size={20} /> : "創建"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Device Dialog */}
      <Dialog
        open={assignDeviceDialogOpen}
        onClose={handleCloseAssignDeviceDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>綁定設備到公司</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              選擇要綁定到 <strong>{selectedCompany?.name}</strong> 的設備
            </Typography>
            <FormControl fullWidth>
              <InputLabel>選擇設備</InputLabel>
              <Select
                value={selectedDeviceToAssign}
                onChange={(e) => setSelectedDeviceToAssign(e.target.value as number | "")}
                label="選擇設備"
              >
                <MenuItem value="">
                  <em>請選擇設備</em>
                </MenuItem>
                {unassignedDevices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.sn} (ID: {device.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {unassignedDevices.length === 0 && (
              <Alert severity="info">
                目前沒有可用的設備。請先在「設備管理」中新增設備。
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDeviceDialog}>取消</Button>
          <Button
            onClick={handleAssignDevice}
            variant="contained"
            disabled={loading || !selectedDeviceToAssign}
          >
            {loading ? <CircularProgress size={20} /> : "綁定"}
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

export default CompanyManagement;

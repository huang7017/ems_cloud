"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TextField,
  Button,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Alert,
  AlertTitle,
  Badge,
} from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';
import {
  CheckCircle as CheckCircleIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Bolt as BoltIcon,
  Park as EcoIcon,
  Thermostat as ThermostatIcon,
  DevicesOther as DevicesIcon,
  ShowChart as ShowChartIcon,
  Cloud as CloudIcon,
  WbSunny as WbSunnyIcon,
  Opacity as OpacityIcon,
  Air as AirIcon,
  Lightbulb as LightbulbIcon,
  Build as BuildIcon,
  AcUnit as AcUnitIcon,
  OpenInNew as OpenInNewIcon,
  ArrowForward as ArrowForwardIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "./reducer";
import {
  companiesListSelector,
  companyAreasListSelector,
  summarySelector,
  filteredAreasSelector,
  selectedCompanyIdSelector,
  selectedAreaIdSelector,
  totalElectricityUsageSelector,
  totalPowerSelector,
  averageTemperatureSelector,
  averageHumiditySelector,
  totalRunningACSelector,
  totalACPackagesSelector,
  anyLoadingSelector,
  selectedCompanyMetersHistorySelector,
  selectedCompanyTemperaturesHistorySelector,
  metersLoadingSelector,
  temperaturesLoadingSelector,
  temperatureRangeSelector,
  anomalyAlertsSelector,
  alertCountsSelector,
  type AnomalyAlert,
} from "./selector";
import { formatTimestamp, formatShortTimestamp, formatDateKey } from "../../helper/utils";
import { useWebSocket, type ACStatusUpdate, type VRFStatusUpdate } from "../../hooks/useWebSocket";

// Styled components
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const DeviceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

const ESGProgressCircle = styled(Box)(() => ({
  position: "relative",
  width: 100,
  height: 100,
  borderRadius: "50%",
  backgroundColor: "#e2e8f0",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Device detail dialog state
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  // Alerts section expanded state
  const [alertsExpanded, setAlertsExpanded] = useState(true);

  // Dashboard data
  const companies = useSelector(companiesListSelector);
  const companyAreas = useSelector(companyAreasListSelector);
  const summary = useSelector(summarySelector);
  const filteredAreas = useSelector(filteredAreasSelector);
  const selectedCompanyId = useSelector(selectedCompanyIdSelector);
  const selectedAreaId = useSelector(selectedAreaIdSelector);
  const loading = useSelector(anyLoadingSelector);

  // Trend data
  const metersHistory = useSelector(selectedCompanyMetersHistorySelector);
  const temperaturesHistory = useSelector(selectedCompanyTemperaturesHistorySelector);
  const metersLoading = useSelector(metersLoadingSelector);
  const temperaturesLoading = useSelector(temperaturesLoadingSelector);

  // Computed values
  const totalElectricity = useSelector(totalElectricityUsageSelector);
  const totalPower = useSelector(totalPowerSelector);
  const avgTemperature = useSelector(averageTemperatureSelector);
  const avgHumidity = useSelector(averageHumiditySelector);
  const runningAC = useSelector(totalRunningACSelector);
  const totalAC = useSelector(totalACPackagesSelector);

  // Temperature range and anomaly alerts
  const temperatureRange = useSelector(temperatureRangeSelector);
  const anomalyAlerts = useSelector(anomalyAlertsSelector);
  const alertCounts = useSelector(alertCountsSelector);

  // Helper function to get local date string in YYYY-MM-DD format
  // This ensures we use the local timezone date, not UTC date
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date range state for trend charts
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default: last 7 days
    return getLocalDateString(date);
  });
  const [endDate, setEndDate] = useState(() => {
    return getLocalDateString(new Date());
  });
  const [trendTab, setTrendTab] = useState(0); // 0: 能源, 1: 温度

  // Convert local date to UTC with full day range
  // dateString: "YYYY-MM-DD" format
  // Returns UTC ISO string for the selected date at 00:00:00 (converted to UTC)
  const convertLocalDateToUTCStart = (dateString: string): string => {
    // Create date object at midnight in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    // Convert to UTC ISO string
    return localDate.toISOString();
  };

  // Convert local date to UTC with full day range
  // dateString: "YYYY-MM-DD" format
  // Returns UTC ISO string for the selected date at 23:59:59 (converted to UTC)
  const convertLocalDateToUTCEnd = (dateString: string): string => {
    // Create date object at 23:59:59 in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    // Convert to UTC ISO string
    return localDate.toISOString();
  };

  // Fetch companies list on mount
  useEffect(() => {
    dispatch(actions.fetchCompaniesList());
    dispatch(actions.fetchAllDashboardData(undefined));
  }, [dispatch]);

  // Auto-query 7-day trend data when company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      
      // Get date strings in YYYY-MM-DD format using local timezone
      const startDateStr = getLocalDateString(start);
      const endDateStr = getLocalDateString(end);
      
      // Convert local dates to UTC with full day range
      const startTime = convertLocalDateToUTCStart(startDateStr);
      const endTime = convertLocalDateToUTCEnd(endDateStr);
      
      // Auto-fetch energy trend data
      dispatch(actions.fetchMeters({
        company_id: selectedCompanyId,
        start_time: startTime,
        end_time: endTime,
      }));
      
      // Auto-fetch temperature trend data
      dispatch(actions.fetchTemperatures({
        company_id: selectedCompanyId,
        start_time: startTime,
        end_time: endTime,
      }));
    }
  }, [selectedCompanyId, dispatch]);

  // Fetch company areas list when company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(actions.fetchCompanyAreasList({ company_id: selectedCompanyId }));
      dispatch(actions.fetchAreas({ company_id: selectedCompanyId }));
    }
  }, [selectedCompanyId, dispatch]);

  // WebSocket real-time updates
  const handleACStatusUpdate = useCallback((data: ACStatusUpdate) => {
    dispatch(actions.updateACStatus(data));
  }, [dispatch]);

  const handleVRFStatusUpdate = useCallback((data: VRFStatusUpdate) => {
    dispatch(actions.updateVRFStatus(data));
  }, [dispatch]);

  // WebSocket connection for real-time updates
  useWebSocket({
    companyId: selectedCompanyId ?? undefined,
    onACStatus: handleACStatusUpdate,
    onVRFStatus: handleVRFStatusUpdate,
    enabled: !!selectedCompanyId,
  });

  // Handle company selection change
  const handleCompanyChange = (companyId: number) => {
    dispatch(actions.setSelectedCompanyId(companyId));
  };

  // Handle area selection change
  const handleAreaChange = (areaId: string) => {
    dispatch(actions.setSelectedAreaId(areaId || null));
  };

  // Handle date range query for trends
  const handleQueryTrends = () => {
    if (!selectedCompanyId) return;
    
    // Convert local dates to UTC with full day range
    const startTime = convertLocalDateToUTCStart(startDate);
    const endTime = convertLocalDateToUTCEnd(endDate);
    
    if (trendTab === 0) {
      // Query energy trends
      dispatch(actions.fetchMeters({
        company_id: selectedCompanyId,
        start_time: startTime,
        end_time: endTime,
      }));
    } else {
      // Query temperature trends
      dispatch(actions.fetchTemperatures({
        company_id: selectedCompanyId,
        start_time: startTime,
        end_time: endTime,
      }));
    }
  };

  // Quick date range shortcuts
  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(getLocalDateString(start));
    setEndDate(getLocalDateString(end));
  };

  // Navigation handlers
  const handleNavigateToEnergy = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCompanyId) params.set('company_id', selectedCompanyId.toString());
    params.set('start', startDate);
    params.set('end', endDate);
    navigate(`/analyze/energy?${params.toString()}`);
  }, [navigate, selectedCompanyId, startDate, endDate]);

  const handleNavigateToTemperature = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCompanyId) params.set('company_id', selectedCompanyId.toString());
    params.set('start', startDate);
    params.set('end', endDate);
    navigate(`/analyze/temperature?${params.toString()}`);
  }, [navigate, selectedCompanyId, startDate, endDate]);

  const handleNavigateToCompanyManagement = useCallback(() => {
    navigate('/setting/company');
  }, [navigate]);

  const handleNavigateToDeviceManagement = useCallback(() => {
    navigate('/setting/device');
  }, [navigate]);

  // Device click handler
  const handleDeviceClick = useCallback((device: any, sensor: any) => {
    setSelectedDevice({ ...device, sensor });
    setDeviceDialogOpen(true);
  }, []);

  // Aggregate energy data by day
  const aggregateEnergyByDay = () => {
    const dailyData: Record<string, {
      totalKw: number;
      maxKWh: number; // 当天最大读数
      minKWh: number; // 当天最小读数
      lastKWh: number; // 当天最后一笔读数（总度数）
      count: number;
      lastTimestamp: string;
    }> = {};

    metersHistory.forEach((data) => {
      // 使用 YYYY-MM-DD 格式作为键，确保跨年份时排序正确
      const dateKey = formatDateKey(data.timestamp);

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          totalKw: 0,
          maxKWh: data.k_wh,
          minKWh: data.k_wh,
          lastKWh: data.k_wh,
          count: 0,
          lastTimestamp: data.timestamp
        };
      }

      dailyData[dateKey].totalKw += data.kw;
      dailyData[dateKey].maxKWh = Math.max(dailyData[dateKey].maxKWh, data.k_wh);
      dailyData[dateKey].minKWh = Math.min(dailyData[dateKey].minKWh, data.k_wh);
      dailyData[dateKey].count += 1;

      // 保留最新的读数作为当天的总度数
      if (new Date(data.timestamp) > new Date(dailyData[dateKey].lastTimestamp)) {
        dailyData[dateKey].lastKWh = data.k_wh;
        dailyData[dateKey].lastTimestamp = data.timestamp;
      }
    });

    // Sort by date (YYYY-MM-DD format, string sort works correctly)
    const sortedDateKeys = Object.keys(dailyData).sort();

    // Calculate daily consumption
    const dailyConsumption = sortedDateKeys.map((dateKey, index) => {
      if (index === 0) {
        // 第一天：用当天最大 - 最小
        const dayData = dailyData[dateKey];
        return (dayData.maxKWh - dayData.minKWh).toFixed(1);
      }
      // 其他天：今天最后读数 - 昨天最后读数
      const previousDateKey = sortedDateKeys[index - 1];
      const todayKWh = dailyData[dateKey].lastKWh;
      const yesterdayKWh = dailyData[previousDateKey].lastKWh;
      return (todayKWh - yesterdayKWh).toFixed(1);
    });

    // 转换为显示格式 MM/DD
    const displayDates = sortedDateKeys.map(dateKey => {
      // dateKey 格式: YYYY-MM-DD，转换为 MM/DD 显示
      const [, month, day] = dateKey.split('-');
      return `${month}/${day}`;
    });

    return {
      dates: displayDates,
      avgKw: sortedDateKeys.map(dateKey => (dailyData[dateKey].totalKw / dailyData[dateKey].count).toFixed(1)),
      dailyKWh: dailyConsumption, // 每日用电量
    };
  };

  // Energy Trend Display Component
  const EnergyTrendDisplay = () => {
    if (metersLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (metersHistory.length === 0) {
      return (
        <Box sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          borderRadius: 1,
          p: 3,
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedCompanyId ? "查詢中，請稍候..." : "請先選擇公司"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            預設自動查詢最近7天數據
          </Typography>
        </Box>
      );
    }

    const chartData = aggregateEnergyByDay();

    return (
      <Box>
        <Box sx={{ height: 280 }}>
          <LineChart
            xAxis={[
              {
                data: chartData.dates.map((_, index) => index),
                scaleType: 'point',
                valueFormatter: (value) => chartData.dates[value],
              },
            ]}
            series={[
              {
                data: chartData.dailyKWh.map(Number),
                label: '每日用電量 (kWh)',
                color: '#10b981',
                curve: 'linear',
                showMark: true,
                area: true,
              },
              {
                data: chartData.avgKw.map(Number),
                label: '平均功率 (kW)',
                color: '#0ea5e9',
                curve: 'linear',
                showMark: true,
              },
            ]}
            height={250}
            margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
          />
        </Box>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            📊 每日用電統計
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {chartData.dates.map((date, index) => (
              <Box key={date} sx={{ 
                minWidth: 100, 
                p: 1.5, 
                backgroundColor: "white", 
                borderRadius: 1,
                border: "1px solid #e2e8f0"
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  📅 {date}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981", mb: 0.5 }}>
                  {chartData.dailyKWh[index]} kWh
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  平均功率
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0ea5e9" }}>
                  {chartData.avgKw[index]} kW
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  // Aggregate temperature data by day
  const aggregateTemperatureByDay = () => {
    const dailyData: Record<string, {
      totalTemp: number;
      totalHumidity: number;
      totalHeatIndex: number;
      count: number;
    }> = {};

    temperaturesHistory.forEach((data) => {
      // 使用 YYYY-MM-DD 格式作为键，确保跨年份时排序正确
      const dateKey = formatDateKey(data.timestamp);

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { totalTemp: 0, totalHumidity: 0, totalHeatIndex: 0, count: 0 };
      }

      dailyData[dateKey].totalTemp += data.temperature;
      dailyData[dateKey].totalHumidity += data.humidity;
      dailyData[dateKey].totalHeatIndex += data.heat_index;
      dailyData[dateKey].count += 1;
    });

    // Sort by date (YYYY-MM-DD format, string sort works correctly)
    const sortedDateKeys = Object.keys(dailyData).sort();

    // 转换为显示格式 MM/DD
    const displayDates = sortedDateKeys.map(dateKey => {
      // dateKey 格式: YYYY-MM-DD，转换为 MM/DD 显示
      const [, month, day] = dateKey.split('-');
      return `${month}/${day}`;
    });

    return {
      dates: displayDates,
      avgTemp: sortedDateKeys.map(dateKey => (dailyData[dateKey].totalTemp / dailyData[dateKey].count).toFixed(1)),
      avgHumidity: sortedDateKeys.map(dateKey => (dailyData[dateKey].totalHumidity / dailyData[dateKey].count).toFixed(1)),
      avgHeatIndex: sortedDateKeys.map(dateKey => (dailyData[dateKey].totalHeatIndex / dailyData[dateKey].count).toFixed(1)),
    };
  };

  // Temperature Trend Display Component
  const TemperatureTrendDisplay = () => {
    if (temperaturesLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (temperaturesHistory.length === 0) {
      return (
        <Box sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          borderRadius: 1,
          p: 3,
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedCompanyId ? "查詢中，請稍候..." : "請先選擇公司"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            預設自動查詢最近7天數據
          </Typography>
        </Box>
      );
    }

    const chartData = aggregateTemperatureByDay();

    return (
      <Box>
        <Box sx={{ height: 280 }}>
          <LineChart
            xAxis={[
              {
                data: chartData.dates.map((_, index) => index),
                scaleType: 'point',
                valueFormatter: (value) => chartData.dates[value],
              },
            ]}
            series={[
              {
                data: chartData.avgTemp.map(Number),
                label: '平均溫度 (°C)',
                color: '#f59e0b',
                curve: 'linear',
                showMark: true,
              },
              {
                data: chartData.avgHumidity.map(Number),
                label: '平均濕度 (%)',
                color: '#0ea5e9',
                curve: 'linear',
                showMark: true,
              },
            ]}
            height={250}
            margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
          />
        </Box>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: "#f8fafc", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            📊 每日統計
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {chartData.dates.map((date, index) => (
              <Box key={date} sx={{ minWidth: 100 }}>
                <Typography variant="caption" color="text.secondary">{date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#f59e0b" }}>
                  {chartData.avgTemp[index]}°C
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  濕度: {chartData.avgHumidity[index]}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  // Show loading state
  if (loading && !summary) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: "#f1f5f9",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Box sx={{ py: 3, px: 3, width: "100%" }}>
        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: isMobile ? "wrap" : "nowrap",
              gap: 2,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              儀表板
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {alertCounts.total > 0 && (
                <Chip
                  icon={alertCounts.critical > 0 ? <ErrorIcon sx={{ fontSize: 16 }} /> : <WarningIcon sx={{ fontSize: 16 }} />}
                  label={`${alertCounts.total} 個警報`}
                  sx={{
                    backgroundColor: alertCounts.critical > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                    color: alertCounts.critical > 0 ? "#ef4444" : "#f59e0b",
                    fontWeight: 500,
                  }}
                />
              )}
              {alertCounts.total === 0 && (
                <Chip
                  icon={<span>🌱</span>}
                  label="系統運行正常"
                  sx={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Anomaly Alerts Section */}
        {anomalyAlerts.length > 0 && (
          <Paper
            elevation={1}
            sx={{
              mb: 3,
              overflow: "hidden",
              border: alertCounts.critical > 0 ? "1px solid #fecaca" : "1px solid #fed7aa",
              backgroundColor: alertCounts.critical > 0 ? "#fef2f2" : "#fffbeb",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
              }}
              onClick={() => setAlertsExpanded(!alertsExpanded)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {alertCounts.critical > 0 ? (
                  <ErrorIcon sx={{ color: "#ef4444", fontSize: 24 }} />
                ) : (
                  <WarningIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: alertCounts.critical > 0 ? "#991b1b" : "#92400e" }}>
                    異常警報
                  </Typography>
                  <Typography variant="body2" sx={{ color: alertCounts.critical > 0 ? "#dc2626" : "#d97706" }}>
                    {alertCounts.critical > 0 && `${alertCounts.critical} 個嚴重警報`}
                    {alertCounts.critical > 0 && alertCounts.warning > 0 && "、"}
                    {alertCounts.warning > 0 && `${alertCounts.warning} 個警告`}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge badgeContent={alertCounts.total} color={alertCounts.critical > 0 ? "error" : "warning"}>
                  <Box />
                </Badge>
                <IconButton size="small">
                  {alertsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>
            <Collapse in={alertsExpanded}>
              <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {anomalyAlerts.slice(0, 5).map((alert: AnomalyAlert) => (
                  <Alert
                    key={alert.id}
                    severity={alert.severity === "critical" ? "error" : "warning"}
                    sx={{
                      "& .MuiAlert-message": { width: "100%" },
                    }}
                  >
                    <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
                      {alert.title}
                    </AlertTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="body2">
                        {alert.description}
                      </Typography>
                      <Chip
                        label={alert.location}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24 }}
                      />
                    </Box>
                  </Alert>
                ))}
                {anomalyAlerts.length > 5 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
                    還有 {anomalyAlerts.length - 5} 個警報...
                  </Typography>
                )}
              </Box>
            </Collapse>
          </Paper>
        )}

        {/* Data Overview Grid */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            alignItems: "stretch",
          }}
        >
          {/* 今日用电量 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard
              elevation={1}
              onClick={handleNavigateToEnergy}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4, transform: "translateY(-2px)" }, transition: "all 0.2s" }}
            >
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <BoltIcon sx={{ color: "#f59e0b", fontSize: 24 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {totalElectricity.toFixed(1)}{" "}
                    <Typography component="span" variant="h6">
                      kWh
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  總用電量
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <FiberManualRecordIcon
                      sx={{ color: "text.secondary", fontSize: 16 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      即時數據
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: "primary.main" }} />
                </Box>
              </Box>
            </StatCard>
          </Box>

          {/* 本月碳排放 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <EcoIcon sx={{ color: "#10b981", fontSize: 24 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {totalPower.toFixed(1)}{" "}
                    <Typography component="span" variant="h6">
                      kW
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  總功率
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FiberManualRecordIcon
                    sx={{ color: "text.secondary", fontSize: 16 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    即時數據
                  </Typography>
                </Box>
              </Box>
            </StatCard>
          </Box>

          {/* 平均室內溫度 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard
              elevation={1}
              onClick={handleNavigateToTemperature}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4, transform: "translateY(-2px)" }, transition: "all 0.2s" }}
            >
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <ThermostatIcon sx={{ color: "#0ea5e9", fontSize: 24 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {avgTemperature ? avgTemperature.toFixed(1) : "--"}{" "}
                    <Typography component="span" variant="h6">°C</Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  平均室內溫度
                  {temperatureRange.min !== null && temperatureRange.max !== null && (
                    <Typography component="span" sx={{ ml: 1, color: "#64748b" }}>
                      ({temperatureRange.min.toFixed(1)}~{temperatureRange.max.toFixed(1)}°C)
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {temperatureRange.min !== null && temperatureRange.max !== null ? (
                      <>
                        {(temperatureRange.min < 18 || temperatureRange.max > 30) ? (
                          <>
                            <WarningIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: "#f59e0b" }}>
                              溫度異常
                            </Typography>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: "success.main" }}>
                              溫度正常
                            </Typography>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <FiberManualRecordIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          無數據
                        </Typography>
                      </>
                    )}
                  </Box>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: "primary.main" }} />
                </Box>
              </Box>
            </StatCard>
          </Box>

          {/* 设备运行状态 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard
              elevation={1}
              onClick={handleNavigateToCompanyManagement}
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4, transform: "translateY(-2px)" }, transition: "all 0.2s" }}
            >
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <DevicesIcon sx={{ color: "#8b5cf6", fontSize: 24 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {runningAC} / {totalAC}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  設備運行狀態
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CheckCircleIcon
                      sx={{ color: "success.main", fontSize: 16 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "success.main", fontWeight: 500 }}
                    >
                      系統運行中
                    </Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ fontSize: 16, color: "primary.main" }} />
                </Box>
              </Box>
            </StatCard>
          </Box>
        </Box>

        {/* Energy Usage Trends and Environment Data */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ flex: "1 1 600px", minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShowChartIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    趨勢分析
                  </Typography>
                </Box>
                <Tooltip title={trendTab === 0 ? "查看能源詳細分析" : "查看溫度詳細分析"}>
                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon />}
                    onClick={trendTab === 0 ? handleNavigateToEnergy : handleNavigateToTemperature}
                    disabled={!selectedCompanyId}
                  >
                    查看詳情
                  </Button>
                </Tooltip>
              </Box>

              {/* Tabs for Energy vs Temperature */}
              <Tabs value={trendTab} onChange={(_e, v) => setTrendTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="能源趨勢" />
                <Tab label="溫度趨勢" />
              </Tabs>

              {/* Date Range Selector */}
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                  type="date"
                  label="開始日期"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 150 }}
                />
                <TextField
                  type="date"
                  label="結束日期"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 150 }}
                />
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleQueryTrends}
                  disabled={!selectedCompanyId}
                >
                  查詢
                </Button>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Chip label="7天" size="small" onClick={() => handleQuickRange(7)} sx={{ cursor: "pointer" }} />
                  <Chip label="30天" size="small" onClick={() => handleQuickRange(30)} sx={{ cursor: "pointer" }} />
                  <Chip label="90天" size="small" onClick={() => handleQuickRange(90)} sx={{ cursor: "pointer" }} />
                </Box>
              </Box>

              {/* Trend Display Area */}
              <Box sx={{ minHeight: 380 }}>
                {!selectedCompanyId ? (
                  <Box sx={{ 
                    height: 380, 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                    backgroundColor: "#f8fafc",
                  borderRadius: 1,
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      請先選擇公司
                </Typography>
                  </Box>
                ) : trendTab === 0 ? (
                  <EnergyTrendDisplay />
                ) : (
                  <TemperatureTrendDisplay />
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: "0 1 300px", minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CloudIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  環境數據
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <WbSunnyIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    平均溫度
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {avgTemperature ? avgTemperature.toFixed(1) : "--"} °C
                </Typography>
                {temperatureRange.min !== null && temperatureRange.max !== null && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    範圍: {temperatureRange.min.toFixed(1)} ~ {temperatureRange.max.toFixed(1)} °C
                  </Typography>
                )}
                <LinearProgress
                  variant="determinate"
                  value={avgTemperature ? Math.min((avgTemperature / 40) * 100, 100) : 0}
                  sx={{
                    height: 4,
                    borderRadius: 1,
                    backgroundColor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#f59e0b",
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <OpacityIcon sx={{ color: "#0ea5e9", fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    平均濕度
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {avgHumidity ? avgHumidity.toFixed(0) : "--"} %
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={avgHumidity || 0}
                  sx={{
                    height: 4,
                    borderRadius: 1,
                    backgroundColor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#0ea5e9",
                    },
                  }}
                />
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <AirIcon sx={{ color: "#22c55e", fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    設備運行率
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {totalAC > 0 ? ((runningAC / totalAC) * 100).toFixed(0) : "0"}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={totalAC > 0 ? (runningAC / totalAC) * 100 : 0}
                  sx={{
                    height: 4,
                    borderRadius: 1,
                    backgroundColor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#22c55e",
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* ESG Performance */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            alignItems: "stretch",
          }}
        >
          <Box sx={{ flex: "1 1 500px", minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <LightbulbIcon sx={{ color: "#10b981", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  系統績效指標
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    設備運行率
                  </Typography>
                  <ESGProgressCircle>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {totalAC > 0 ? ((runningAC / totalAC) * 100).toFixed(0) : "0"}%
                    </Typography>
                  </ESGProgressCircle>
                </Box>
                <Box sx={{ flex: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">運行設備數</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {runningAC} / {totalAC}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={totalAC > 0 ? (runningAC / totalAC) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#10b981",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">總用電量 (kWh)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {totalElectricity.toFixed(1)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((totalElectricity / 10000) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#0ea5e9",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">總功率 (kW)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {totalPower.toFixed(1)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((totalPower / 500) * 100, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#8b5cf6",
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: "1 1 500px", minWidth: 0 }}>
            <Paper elevation={1} sx={{ p: 3, height: "100%" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <BuildIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  節能最佳實踐
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                      backgroundColor: "#0ea5e920",
                      color: "#0ea5e9",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                    1
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                      優化空調使用時段
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                      根據建築物使用狀況調整空調運行，避免無人區域空調運作浪費。
                      </Typography>
                    </Box>
                  </Box>
                <Box
                  sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#10b98120",
                      color: "#10b981",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      溫度設定最佳化
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      設定最佳舒適溫度區間，避免過度製冷/製熱，建議夏季設定26°C。
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#8b5cf620",
                      color: "#8b5cf6",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    3
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      定期維護保養
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      設備定期清潔與保養可提高效率達 5-15%，延長設備壽命。
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Device Status */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AcUnitIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                設備狀態
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* Quick Navigation */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Tooltip title="公司管理">
                  <IconButton size="small" onClick={handleNavigateToCompanyManagement} color="primary">
                    <BusinessIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="設備管理">
                  <IconButton size="small" onClick={handleNavigateToDeviceManagement} color="primary">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedCompanyId || ""}
                  onChange={(e) => handleCompanyChange(Number(e.target.value))}
                  displayEmpty
                >
                  {companies.length === 0 && (
                    <MenuItem value="">載入中...</MenuItem>
                  )}
                  {companies.map((company) => (
                    <MenuItem key={company.company_id} value={company.company_id}>
                      {company.company_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

              {selectedCompanyId && companyAreas.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedAreaId || ""}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">全部區域</MenuItem>
                    {companyAreas.map((area) => (
                      <MenuItem key={area.area_id} value={area.area_id}>
                        {area.area_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>

          {/* 区域卡片展示 */}
          {filteredAreas && filteredAreas.areas.length > 0 ? (
            filteredAreas.areas.map((area) => (
              <Box key={area.area_id} sx={{ mb: 3 }}>
                {/* 区域标题和统计 */}
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      📍 {area.area_name}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">電量</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {area.statistics.total_k_wh.toFixed(1)} kWh
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">功率</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {area.statistics.total_kw.toFixed(1)} kW
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">溫度</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {area.statistics.avg_temperature.toFixed(1)}°C
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">濕度</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {area.statistics.avg_humidity.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">Package</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                          {area.statistics.running_ac_count}/{area.statistics.total_ac_packages}
                        </Typography>
                      </Box>
                      {(area.statistics.total_vrfs || 0) > 0 && (
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary">VRF</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                            {area.statistics.running_vrf_unit_count || 0}/{area.statistics.total_vrf_units || 0}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>

                {/* 设备网格 */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {/* 电表卡片 */}
                  {area.meters.map((meter) => (
                    <Box key={meter.meter_id} sx={{ flex: "1 1 320px", minWidth: 0 }}>
                <DeviceCard elevation={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            ⚡ 電表
                    </Typography>
                          <Chip label="運行中" size="small" color="success" sx={{ height: 20 }} />
                  </Box>
                        {meter.latest_data ? (
                          <>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {meter.latest_data.kw.toFixed(1)} <Typography component="span" variant="body2">kW</Typography>
                  </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              累計: {meter.latest_data.k_wh.toFixed(1)} kWh
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(meter.latest_data.timestamp)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">無數據</Typography>
                        )}
                      </DeviceCard>
                    </Box>
                  ))}

                  {/* Package AC 冷氣卡片（包含溫度感測器數據） */}
                  {area.ac_packages?.map((acPackage, index) => {
                    const sensor = area.sensors[index];
                    const hasRunning = acPackage.compressors?.some(c => c.is_running);
                    return (
                      <Box key={acPackage.package_id} sx={{ flex: "1 1 320px", minWidth: 0 }}>
                        <DeviceCard
                          elevation={1}
                          onClick={() => handleDeviceClick(acPackage, sensor)}
                          sx={{ cursor: "pointer" }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              ❄️ {acPackage.package_name}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                              <Chip
                                label={hasRunning ? "運行中" : "待機"}
                                size="small"
                                color={hasRunning ? "success" : "default"}
                                sx={{ height: 20 }}
                              />
                              <Tooltip title="查看詳情">
                                <InfoIcon fontSize="small" sx={{ color: "text.secondary", opacity: 0.6 }} />
                              </Tooltip>
                            </Box>
                          </Box>
                          {sensor && sensor.latest_data ? (
                            <>
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                                  {sensor.latest_data.temperature.toFixed(1)}°C
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  目前溫度
                                </Typography>
                              </Box>

                              <Box sx={{
                                backgroundColor: "#f8fafc",
                                borderRadius: 1,
                                p: 1.5,
                                mb: 1,
                                border: "1px solid #e2e8f0"
                              }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
                                    🌡️ 溫度感測器
                                  </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 2, mb: 0.5 }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                      溫度
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {sensor.latest_data.temperature.toFixed(1)}°C
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                      濕度
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {sensor.latest_data.humidity.toFixed(0)}%
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                      體感
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {sensor.latest_data.heat_index.toFixed(1)}°C
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                  ID: {sensor.sensor_id.slice(0, 8)}...
                                </Typography>
                              </Box>

                              <Typography variant="caption" color="text.secondary">
                                更新時間: {formatShortTimestamp(sensor.latest_data.timestamp)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">無溫度數據</Typography>
                          )}
                        </DeviceCard>
                      </Box>
                    );
                  })}

                  {/* VRF 系統卡片 */}
                  {area.vrfs?.map((vrf) => {
                    const runningUnits = vrf.ac_units?.filter(u => u.is_running).length || 0;
                    const totalUnits = vrf.ac_units?.length || 0;
                    return (
                      <Box key={vrf.vrf_id} sx={{ flex: "1 1 320px", minWidth: 0 }}>
                        <DeviceCard
                          elevation={1}
                          sx={{
                            borderLeft: "4px solid #3b82f6",
                            backgroundColor: "#fafbff"
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#3b82f6" }}>
                              🏢 VRF 系統
                            </Typography>
                            <Chip
                              label={`${runningUnits}/${totalUnits} 運行`}
                              size="small"
                              color={runningUnits > 0 ? "primary" : "default"}
                              sx={{ height: 20 }}
                            />
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                            地址: {vrf.address}
                          </Typography>

                          {/* AC Units 列表 */}
                          <Box sx={{
                            backgroundColor: "#f0f4ff",
                            borderRadius: 1,
                            p: 1.5,
                            border: "1px solid #dbeafe",
                            maxHeight: 200,
                            overflow: "auto"
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e40af", mb: 1, display: "block" }}>
                              室內機 ({totalUnits} 台)
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              {vrf.ac_units?.map((unit) => (
                                <Box
                                  key={unit.unit_id}
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    p: 0.75,
                                    backgroundColor: unit.is_running ? "#dcfce7" : "#fff",
                                    borderRadius: 0.5,
                                    border: "1px solid",
                                    borderColor: unit.is_running ? "#86efac" : "#e5e7eb"
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        backgroundColor: unit.is_running ? "#22c55e" : "#9ca3af"
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                      {unit.name || `Unit #${unit.number}`}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {unit.location || "-"}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </DeviceCard>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {selectedCompanyId ? "該公司暫無設備資料" : "請選擇公司查看設備"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCompanyId ? "請確認該公司已配置設備和感測器" : "從上方下拉選單選擇要查看的公司"}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Device Detail Dialog */}
        <Dialog
          open={deviceDialogOpen}
          onClose={() => setDeviceDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AcUnitIcon color="primary" />
              {selectedDevice?.package_name || "設備詳情"}
            </Box>
            <IconButton size="small" onClick={() => setDeviceDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedDevice && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Device Info */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    設備資訊
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">設備名稱</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedDevice.package_name}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">設備 ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {selectedDevice.package_id?.slice(0, 12)}...
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Sensor Data */}
                {selectedDevice.sensor?.latest_data && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      感測器數據
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                      <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#fff7ed", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">溫度</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                          {selectedDevice.sensor.latest_data.temperature.toFixed(1)}°C
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#eff6ff", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">濕度</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0ea5e9" }}>
                          {selectedDevice.sensor.latest_data.humidity.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center", p: 1, backgroundColor: "#f5f3ff", borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">體感溫度</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#8b5cf6" }}>
                          {selectedDevice.sensor.latest_data.heat_index.toFixed(1)}°C
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      更新時間: {formatTimestamp(selectedDevice.sensor.latest_data.timestamp)}
                    </Typography>
                  </Paper>
                )}

                {/* Quick Actions */}
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ShowChartIcon />}
                    onClick={() => {
                      setDeviceDialogOpen(false);
                      handleNavigateToTemperature();
                    }}
                  >
                    查看溫度趨勢
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SettingsIcon />}
                    onClick={() => {
                      setDeviceDialogOpen(false);
                      handleNavigateToCompanyManagement();
                    }}
                  >
                    設備管理
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeviceDialogOpen(false)}>關閉</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default HomePage;

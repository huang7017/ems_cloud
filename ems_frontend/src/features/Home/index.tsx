"use client";
import React, { useEffect, useState } from "react";
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
} from "./selector";
import { formatTimestamp, formatShortTimestamp, formatMonthDay } from "../../helper/utils";

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

  // Date range state for trend charts
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default: last 7 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [trendTab, setTrendTab] = useState(0); // 0: 能源, 1: 温度

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
      
      const startTime = start.toISOString();
      const endTime = end.toISOString();
      
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
    
    const startTime = new Date(startDate).toISOString();
    const endTime = new Date(endDate + 'T23:59:59').toISOString();
    
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
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

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
      const date = formatMonthDay(data.timestamp);
      
      if (!dailyData[date]) {
        dailyData[date] = { 
          totalKw: 0, 
          maxKWh: data.k_wh,
          minKWh: data.k_wh,
          lastKWh: data.k_wh,
          count: 0,
          lastTimestamp: data.timestamp
        };
      }
      
      dailyData[date].totalKw += data.kw;
      dailyData[date].maxKWh = Math.max(dailyData[date].maxKWh, data.k_wh);
      dailyData[date].minKWh = Math.min(dailyData[date].minKWh, data.k_wh);
      dailyData[date].count += 1;
      
      // 保留最新的读数作为当天的总度数
      if (new Date(data.timestamp) > new Date(dailyData[date].lastTimestamp)) {
        dailyData[date].lastKWh = data.k_wh;
        dailyData[date].lastTimestamp = data.timestamp;
      }
    });
    
    // Sort by date (MM/DD format)
    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      // a 和 b 格式为 "MM/DD"
      const [monthA, dayA] = a.split('/').map(Number);
      const [monthB, dayB] = b.split('/').map(Number);
      // 先比较月份，再比较日期
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
    
    // Calculate daily consumption
    const dailyConsumption = sortedDates.map((date, index) => {
      if (index === 0) {
        // 第一天：用当天最大 - 最小
        const dayData = dailyData[date];
        return (dayData.maxKWh - dayData.minKWh).toFixed(1);
      }
      // 其他天：今天最后读数 - 昨天最后读数
      const previousDate = sortedDates[index - 1];
      const todayKWh = dailyData[date].lastKWh;
      const yesterdayKWh = dailyData[previousDate].lastKWh;
      return (todayKWh - yesterdayKWh).toFixed(1);
    });
    
    return {
      dates: sortedDates,
      avgKw: sortedDates.map(date => (dailyData[date].totalKw / dailyData[date].count).toFixed(1)),
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
      const date = formatMonthDay(data.timestamp);
      
      if (!dailyData[date]) {
        dailyData[date] = { totalTemp: 0, totalHumidity: 0, totalHeatIndex: 0, count: 0 };
      }
      
      dailyData[date].totalTemp += data.temperature;
      dailyData[date].totalHumidity += data.humidity;
      dailyData[date].totalHeatIndex += data.heat_index;
      dailyData[date].count += 1;
    });
    
    // Sort by date and prepare chart data (MM/DD format)
    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      // a 和 b 格式为 "MM/DD"
      const [monthA, dayA] = a.split('/').map(Number);
      const [monthB, dayB] = b.split('/').map(Number);
      // 先比较月份，再比较日期
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
    
    return {
      dates: sortedDates,
      avgTemp: sortedDates.map(date => (dailyData[date].totalTemp / dailyData[date].count).toFixed(1)),
      avgHumidity: sortedDates.map(date => (dailyData[date].totalHumidity / dailyData[date].count).toFixed(1)),
      avgHeatIndex: sortedDates.map(date => (dailyData[date].totalHeatIndex / dailyData[date].count).toFixed(1)),
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
              <Chip
                icon={<span>🌱</span>}
                label="ESG 績效良好"
                sx={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>
        </Box>

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
            <StatCard elevation={1}>
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

          {/* 平均室内温度 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <ThermostatIcon sx={{ color: "#0ea5e9", fontSize: 24 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {avgTemperature ? avgTemperature.toFixed(1) : "--"}{" "}
                    <Typography component="span" variant="h6">
                      °C
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  平均室內溫度
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FiberManualRecordIcon
                    sx={{ color: "text.secondary", fontSize: 16 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    維持最佳舒適度
                  </Typography>
                </Box>
              </Box>
            </StatCard>
          </Box>

          {/* 设备运行状态 */}
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {avgTemperature ? avgTemperature.toFixed(1) : "--"} °C
                </Typography>
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
            <Box sx={{ display: "flex", gap: 2 }}>
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
                        <Typography variant="caption" color="text.secondary">設備</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                          {area.statistics.running_ac_count}/{area.statistics.total_ac_packages}
                        </Typography>
                      </Box>
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

                  {/* 冷气设备卡片（包含温度感测器数据） */}
                  {area.ac_packages.map((acPackage, index) => {
                    const sensor = area.sensors[index];
                    return (
                      <Box key={acPackage.package_id} sx={{ flex: "1 1 320px", minWidth: 0 }}>
                        <DeviceCard elevation={1}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              ❄️ {acPackage.package_name}
                            </Typography>
                            <Chip label="運行中" size="small" color="success" sx={{ height: 20 }} />
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
      </Box>
    </Box>
  );
};

export default HomePage;

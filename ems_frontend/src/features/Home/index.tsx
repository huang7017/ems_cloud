"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputBase,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  TrendingDown as TrendingDownIcon,
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
  Power as PowerIcon,
  Schedule as ScheduleIcon,
  AutoMode as AutoModeIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  backgroundColor: "white",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  gap: theme.spacing(1),
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e2e8f0",
}));

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

// 假数据
const mockData = {
  // 页面标题和用户信息
  pageTitle: "儀表板",
  userInitials: "AM",
  userRole: "管理员",
  esgStatus: "ESG 績效良好",

  // 数据概览
  overview: {
    electricity: {
      value: 25.4,
      unit: "kWh",
      label: "今日用電量",
      trend: -12.5,
      trendType: "down",
      comparison: "較昨日",
    },
    carbonEmission: {
      value: 3.8,
      unit: "噸",
      label: "本月碳排放",
      trend: -8.2,
      trendType: "down",
      comparison: "較上月",
    },
    temperature: {
      value: 24.8,
      unit: "°C",
      label: "平均室內溫度",
      status: "維持最佳舒適度",
      statusType: "normal",
    },
    deviceStatus: {
      value: "14 / 16",
      label: "設備運行狀態",
      status: "所有系統正常",
      statusType: "success",
    },
  },

  // 环境数据
  environment: {
    outdoorTemp: {
      value: 32.5,
      unit: "°C",
      progress: 85,
    },
    humidity: {
      value: 68,
      unit: "%",
      progress: 68,
    },
    airQuality: {
      value: "良好",
      progress: 60,
    },
  },

  // ESG绩效指标
  esgPerformance: {
    carbonReduction: {
      percentage: 78,
      current: 15.6,
      target: 20,
      unit: "噸",
    },
    energySaving: {
      percentage: 89.6,
      current: 22.4,
      target: 25,
      unit: "%",
    },
    renewableEnergy: {
      percentage: 55.3,
      current: 8.3,
      target: 15,
      unit: "%",
    },
  },

  // 节能最佳实践
  bestPractices: [
    {
      id: 1,
      title: "優化空調使用時段",
      description: "根據建築物使用狀況調整空調運行，避免無人區域空調運作浪費。",
      color: "#0ea5e9",
    },
    {
      id: 2,
      title: "溫度設定最佳化",
      description:
        "設定最佳舒適溫度區間，避免過度製冷/製熱，建議夏季設定26°C。",
      color: "#10b981",
    },
    {
      id: 3,
      title: "定期維護保養",
      description: "設備定期清潔與保養可提高效率達 5-15%，延長設備壽命。",
      color: "#8b5cf6",
    },
  ],

  // 设备状态
  devices: [
    {
      id: "AC-101",
      name: "AC-101",
      temperature: 23,
      mode: "冷氣模式",
      fanSpeed: "中",
      status: "online",
      statusColor: "#22c55e",
    },
    {
      id: "AC-102",
      name: "AC-102",
      temperature: 24,
      mode: "冷氣模式",
      fanSpeed: "低",
      status: "online",
      statusColor: "#22c55e",
    },
    {
      id: "AC-201",
      name: "AC-201",
      temperature: null,
      mode: "已關閉",
      fanSpeed: "排程中",
      status: "offline",
      statusColor: "#94a3b8",
    },
    {
      id: "AC-202",
      name: "AC-202",
      temperature: 25,
      mode: "省電模式",
      fanSpeed: "自動",
      status: "online",
      statusColor: "#22c55e",
    },
  ],

  // 时间范围选项
  timeRanges: [
    { value: "daily", label: "日檢視" },
    { value: "weekly", label: "週檢視" },
    { value: "monthly", label: "月檢視" },
  ],

  // 设备分组选项
  deviceGroups: [
    { value: "all", label: "全部設備" },
    { value: "group1", label: "第一群組" },
    { value: "group2", label: "第二群組" },
  ],
};

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
              {mockData.pageTitle}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <SearchBox>
                <SearchIcon sx={{ color: "text.secondary" }} />
                <InputBase
                  placeholder="搜尋..."
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </SearchBox>
              <Chip
                icon={<span>🌱</span>}
                label={mockData.esgStatus}
                sx={{
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  fontWeight: 500,
                }}
              />
              <Avatar
                sx={{
                  bgcolor: "#8b5cf6",
                  width: 40,
                  height: 40,
                  fontWeight: 600,
                }}
              >
                {mockData.userInitials}
              </Avatar>
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
                    {mockData.overview.electricity.value}{" "}
                    <Typography component="span" variant="h6">
                      {mockData.overview.electricity.unit}
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {mockData.overview.electricity.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TrendingDownIcon
                    sx={{ color: "error.main", fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "error.main", fontWeight: 500 }}
                  >
                    {Math.abs(mockData.overview.electricity.trend)}%{" "}
                    {mockData.overview.electricity.comparison}
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
                    {mockData.overview.carbonEmission.value}{" "}
                    <Typography component="span" variant="h6">
                      {mockData.overview.carbonEmission.unit}
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {mockData.overview.carbonEmission.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TrendingDownIcon
                    sx={{ color: "success.main", fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "success.main", fontWeight: 500 }}
                  >
                    {Math.abs(mockData.overview.carbonEmission.trend)}%{" "}
                    {mockData.overview.carbonEmission.comparison}
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
                    {mockData.overview.temperature.value}{" "}
                    <Typography component="span" variant="h6">
                      {mockData.overview.temperature.unit}
                    </Typography>
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {mockData.overview.temperature.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FiberManualRecordIcon
                    sx={{ color: "text.secondary", fontSize: 16 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {mockData.overview.temperature.status}
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
                    {mockData.overview.deviceStatus.value}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {mockData.overview.deviceStatus.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CheckCircleIcon
                    sx={{ color: "success.main", fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "success.main", fontWeight: 500 }}
                  >
                    {mockData.overview.deviceStatus.status}
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ShowChartIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    能源使用趨勢
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select defaultValue="daily" displayEmpty>
                    {mockData.timeRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box
                sx={{
                  height: 250,
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  圖表：能源使用趨勢
                </Typography>
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
                    室外溫度
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {mockData.environment.outdoorTemp.value}{" "}
                  {mockData.environment.outdoorTemp.unit}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={mockData.environment.outdoorTemp.progress}
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
                  {mockData.environment.humidity.value}{" "}
                  {mockData.environment.humidity.unit}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={mockData.environment.humidity.progress}
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
                    空氣品質
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {mockData.environment.airQuality.value}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={mockData.environment.airQuality.progress}
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
                  ESG 績效指標
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    碳減排達成率
                  </Typography>
                  <ESGProgressCircle>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {mockData.esgPerformance.carbonReduction.percentage}%
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
                      <Typography variant="body2">
                        減碳量 ({mockData.esgPerformance.carbonReduction.unit})
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mockData.esgPerformance.carbonReduction.current} /{" "}
                        {mockData.esgPerformance.carbonReduction.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mockData.esgPerformance.carbonReduction.percentage}
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
                      <Typography variant="body2">節能率 (%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mockData.esgPerformance.energySaving.current} /{" "}
                        {mockData.esgPerformance.energySaving.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mockData.esgPerformance.energySaving.percentage}
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
                      <Typography variant="body2">再生能源占比 (%)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mockData.esgPerformance.renewableEnergy.current} /{" "}
                        {mockData.esgPerformance.renewableEnergy.target}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mockData.esgPerformance.renewableEnergy.percentage}
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
                {mockData.bestPractices.map((practice) => (
                  <Box
                    key={practice.id}
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: `${practice.color}20`,
                        color: practice.color,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {practice.id}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {practice.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {practice.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select defaultValue="all" displayEmpty>
                {mockData.deviceGroups.map((group) => (
                  <MenuItem key={group.value} value={group.value}>
                    {group.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {mockData.devices.map((device) => (
              <Box key={device.id} sx={{ flex: "1 1 300px", minWidth: 0 }}>
                <DeviceCard elevation={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {device.name}
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: device.statusColor,
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {device.temperature ? `${device.temperature}°C` : "--"}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {device.status === "online" ? (
                        <PowerIcon sx={{ color: "#22c55e", fontSize: 14 }} />
                      ) : (
                        <ScheduleIcon sx={{ color: "#94a3b8", fontSize: 14 }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {device.mode}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <AutoModeIcon sx={{ color: "#64748b", fontSize: 14 }} />
                      <Typography variant="body2" color="text.secondary">
                        風速：{device.fanSpeed}
                      </Typography>
                    </Box>
                  </Box>
                </DeviceCard>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;

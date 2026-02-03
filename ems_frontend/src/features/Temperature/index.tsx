"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from "@mui/material";
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Thermostat as ThermostatIcon,
  Home as HomeIcon,
  Download as DownloadIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { actions } from "../Home/reducer";
import {
  companiesListSelector,
  selectedCompanyIdSelector,
  selectedCompanyTemperaturesHistorySelector,
  temperaturesLoadingSelector,
} from "../Home/selector";
import { formatTimestamp, formatShortTimestamp } from "../../helper/utils";

// Helper function to get local date string in YYYY-MM-DD format
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert local date to UTC with full day range
const convertLocalDateToUTCStart = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  return localDate.toISOString();
};

const convertLocalDateToUTCEnd = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 23, 59, 59, 999);
  return localDate.toISOString();
};

const TemperaturePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redux selectors
  const companies = useSelector(companiesListSelector);
  const selectedCompanyId = useSelector(selectedCompanyIdSelector);
  const temperaturesHistory = useSelector(selectedCompanyTemperaturesHistorySelector);
  const loading = useSelector(temperaturesLoadingSelector);

  // Area filter state
  const [selectedArea, setSelectedArea] = useState<string>("");

  // Date range state - check URL params first
  const [startDate, setStartDate] = useState(() => {
    const urlStart = searchParams.get('start');
    if (urlStart) return urlStart;
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default: last 7 days
    return getLocalDateString(date);
  });
  const [endDate, setEndDate] = useState(() => {
    const urlEnd = searchParams.get('end');
    if (urlEnd) return urlEnd;
    return getLocalDateString(new Date());
  });

  // Fetch companies list on mount
  useEffect(() => {
    dispatch(actions.fetchCompaniesList());
  }, [dispatch]);

  // Check URL params for company_id
  useEffect(() => {
    const urlCompanyId = searchParams.get('company_id');
    if (urlCompanyId && !selectedCompanyId) {
      dispatch(actions.setSelectedCompanyId(Number(urlCompanyId)));
    }
  }, [searchParams, dispatch, selectedCompanyId]);

  // Export CSV function
  const handleExportCSV = () => {
    if (temperaturesHistory.length === 0) return;

    const headers = ['時間', '區域', '感測器ID', '溫度(°C)', '濕度(%)', '體感溫度(°C)'];
    const rows = [...temperaturesHistory]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(row => [
        formatTimestamp(row.timestamp),
        row.area_name,
        row.sensor_id,
        row.temperature.toFixed(1),
        row.humidity.toFixed(1),
        row.heat_index.toFixed(1),
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `temperature_data_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Auto-query data when company or date range changes
  useEffect(() => {
    if (selectedCompanyId) {
      const startTime = convertLocalDateToUTCStart(startDate);
      const endTime = convertLocalDateToUTCEnd(endDate);
      
      dispatch(actions.fetchTemperatures({
        company_id: selectedCompanyId,
        start_time: startTime,
        end_time: endTime,
      }));
    }
  }, [selectedCompanyId, startDate, endDate, dispatch]);

  // Handle company selection change
  const handleCompanyChange = (companyId: number) => {
    dispatch(actions.setSelectedCompanyId(companyId));
  };

  // Handle date range query
  const handleQuery = () => {
    if (!selectedCompanyId) return;
    
    const startTime = convertLocalDateToUTCStart(startDate);
    const endTime = convertLocalDateToUTCEnd(endDate);
    
    dispatch(actions.fetchTemperatures({
      company_id: selectedCompanyId,
      start_time: startTime,
      end_time: endTime,
    }));
  };

  // Quick date range shortcuts
  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(getLocalDateString(start));
    setEndDate(getLocalDateString(end));
  };

  // Get unique areas for filter dropdown
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    temperaturesHistory.forEach((data) => {
      if (data.area_name) areas.add(data.area_name);
    });
    return Array.from(areas).sort();
  }, [temperaturesHistory]);

  // Filter data by selected area
  const filteredHistory = useMemo(() => {
    if (!selectedArea) return temperaturesHistory;
    return temperaturesHistory.filter((data) => data.area_name === selectedArea);
  }, [temperaturesHistory, selectedArea]);

  // Per-area statistics
  const areaStatistics = useMemo(() => {
    if (temperaturesHistory.length === 0) return [];

    const areaStats: Record<string, {
      areaName: string;
      count: number;
      avgTemp: number;
      minTemp: number;
      maxTemp: number;
      avgHumidity: number;
      latestTemp: number;
      latestTimestamp: string;
    }> = {};

    temperaturesHistory.forEach((data) => {
      const area = data.area_name || '未知區域';
      if (!areaStats[area]) {
        areaStats[area] = {
          areaName: area,
          count: 0,
          avgTemp: 0,
          minTemp: data.temperature,
          maxTemp: data.temperature,
          avgHumidity: 0,
          latestTemp: data.temperature,
          latestTimestamp: data.timestamp,
        };
      }

      areaStats[area].count += 1;
      areaStats[area].avgTemp += data.temperature;
      areaStats[area].avgHumidity += data.humidity;
      if (data.temperature < areaStats[area].minTemp) {
        areaStats[area].minTemp = data.temperature;
      }
      if (data.temperature > areaStats[area].maxTemp) {
        areaStats[area].maxTemp = data.temperature;
      }

      // Track latest reading
      if (new Date(data.timestamp) > new Date(areaStats[area].latestTimestamp)) {
        areaStats[area].latestTemp = data.temperature;
        areaStats[area].latestTimestamp = data.timestamp;
      }
    });

    // Calculate averages
    Object.values(areaStats).forEach((stats) => {
      stats.avgTemp = stats.avgTemp / stats.count;
      stats.avgHumidity = stats.avgHumidity / stats.count;
    });

    return Object.values(areaStats).sort((a, b) => a.areaName.localeCompare(b.areaName));
  }, [temperaturesHistory]);

  // Prepare chart data - group by hour for better visualization
  const chartData = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        timestamps: [] as number[],
        temperatureLabels: [] as string[],
        temperatures: [] as number[],
        humidities: [] as number[],
        heatIndexes: [] as number[],
      };
    }

    // Sort by timestamp ascending for chart
    const sortedData = [...filteredHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      timestamps: sortedData.map((_, index) => index),
      temperatureLabels: sortedData.map((data) => formatShortTimestamp(data.timestamp)),
      temperatures: sortedData.map((data) => data.temperature),
      humidities: sortedData.map((data) => data.humidity),
      heatIndexes: sortedData.map((data) => data.heat_index),
    };
  }, [filteredHistory]);

  // Prepare table data - sorted by timestamp descending (newest first)
  const tableData = useMemo(() => {
    return [...filteredHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredHistory]);

  // Calculate statistics (for filtered data)
  const statistics = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        avgTemperature: 0,
        maxTemperature: 0,
        minTemperature: 0,
        avgHumidity: 0,
        maxHumidity: 0,
        minHumidity: 0,
        avgHeatIndex: 0,
        maxHeatIndex: 0,
        minHeatIndex: 0,
      };
    }

    const temps = filteredHistory.map((d) => d.temperature);
    const humids = filteredHistory.map((d) => d.humidity);
    const heatIndexes = filteredHistory.map((d) => d.heat_index);

    return {
      avgTemperature: temps.reduce((a, b) => a + b, 0) / temps.length,
      maxTemperature: Math.max(...temps),
      minTemperature: Math.min(...temps),
      avgHumidity: humids.reduce((a, b) => a + b, 0) / humids.length,
      maxHumidity: Math.max(...humids),
      minHumidity: Math.min(...humids),
      avgHeatIndex: heatIndexes.reduce((a, b) => a + b, 0) / heatIndexes.length,
      maxHeatIndex: Math.max(...heatIndexes),
      minHeatIndex: Math.min(...heatIndexes),
    };
  }, [filteredHistory]);

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ThermostatIcon sx={{ color: "#0ea5e9", fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                溫度查詢
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="能源分析">
                <IconButton
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (selectedCompanyId) params.set('company_id', selectedCompanyId.toString());
                    params.set('start', startDate);
                    params.set('end', endDate);
                    navigate(`/analyze/energy?${params.toString()}`);
                  }}
                  color="primary"
                >
                  <BoltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="返回首頁">
                <IconButton onClick={() => navigate('/')} color="primary">
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="匯出 CSV">
                <IconButton onClick={handleExportCSV} disabled={temperaturesHistory.length === 0} color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
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

            {availableAreas.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">全部區域</MenuItem>
                  {availableAreas.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
              onClick={handleQuery}
              disabled={!selectedCompanyId}
            >
              查詢
            </Button>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Chip
                label="1天"
                size="small"
                onClick={() => handleQuickRange(1)}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="7天"
                size="small"
                onClick={() => handleQuickRange(7)}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="30天"
                size="small"
                onClick={() => handleQuickRange(30)}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Per-Area Statistics Cards */}
        {areaStatistics.length > 0 && !selectedArea && (
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <ThermostatIcon sx={{ color: "#f59e0b" }} />
              各區域溫度概況
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {areaStatistics.map((stats) => {
                const isWarning = stats.maxTemp > 30 || stats.minTemp < 18;
                return (
                  <Paper
                    key={stats.areaName}
                    elevation={0}
                    sx={{
                      p: 2,
                      flex: "1 1 200px",
                      minWidth: 200,
                      maxWidth: 300,
                      border: "1px solid",
                      borderColor: isWarning ? "#fed7aa" : "#e2e8f0",
                      backgroundColor: isWarning ? "#fffbeb" : "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 2,
                        transform: "translateY(-2px)",
                      },
                    }}
                    onClick={() => setSelectedArea(stats.areaName)}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {stats.areaName}
                      </Typography>
                      {isWarning && (
                        <Chip label="異常" size="small" color="warning" sx={{ height: 20 }} />
                      )}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b", mb: 0.5 }}>
                      {stats.minTemp.toFixed(1)} ~ {stats.maxTemp.toFixed(1)}°C
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        目前: {stats.latestTemp.toFixed(1)}°C
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        濕度: {stats.avgHumidity.toFixed(0)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {stats.count} 筆紀錄
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Statistics Cards (for filtered data) */}
        {filteredHistory.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {selectedArea ? `${selectedArea} - 溫度統計` : "溫度統計（全部區域）"}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#f59e0b" }}>
                {statistics.minTemperature.toFixed(1)} ~ {statistics.maxTemperature.toFixed(1)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均: {statistics.avgTemperature.toFixed(1)}°C
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                濕度統計
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#0ea5e9" }}>
                {statistics.minHumidity.toFixed(1)} ~ {statistics.maxHumidity.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均: {statistics.avgHumidity.toFixed(1)}%
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px", minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                體感溫度統計
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#8b5cf6" }}>
                {statistics.minHeatIndex.toFixed(1)} ~ {statistics.maxHeatIndex.toFixed(1)}°C
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均: {statistics.avgHeatIndex.toFixed(1)}°C
              </Typography>
            </Paper>
            {selectedArea && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedArea("")}
                sx={{ alignSelf: "center" }}
              >
                清除區域過濾
              </Button>
            )}
          </Box>
        )}

        {/* Chart Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            趨勢圖表
          </Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : temperaturesHistory.length === 0 ? (
            <Box sx={{ 
              height: 300, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              backgroundColor: "#f8fafc",
              borderRadius: 1,
            }}>
              <Typography variant="body2" color="text.secondary">
                {selectedCompanyId ? "查詢中，請稍候..." : "請先選擇公司並設定日期範圍"}
              </Typography>
            </Box>
          ) : (
            <Box>
              {/* Temperature and Heat Index Chart */}
              <Box sx={{ height: 350, mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  溫度與體感溫度趨勢
                </Typography>
                <LineChart
                  xAxis={[
                    {
                      data: chartData.timestamps,
                      scaleType: 'point',
                      valueFormatter: (value: number | null) => {
                        if (value === null || value === undefined) return '';
                        const index = Number(value);
                        if (index >= 0 && index < chartData.temperatureLabels.length) {
                          // Show fewer labels for better readability
                          if (chartData.timestamps.length > 20) {
                            return index % Math.ceil(chartData.timestamps.length / 10) === 0
                              ? chartData.temperatureLabels[index]
                              : '';
                          }
                          return chartData.temperatureLabels[index];
                        }
                        return '';
                      },
                    },
                  ]}
                  series={[
                    {
                      data: chartData.temperatures,
                      label: '溫度 (°C)',
                      color: '#f59e0b',
                      curve: 'linear',
                      showMark: chartData.timestamps.length <= 50,
                    },
                    {
                      data: chartData.heatIndexes,
                      label: '體感溫度 (°C)',
                      color: '#8b5cf6',
                      curve: 'linear',
                      showMark: chartData.timestamps.length <= 50,
                    },
                  ]}
                  height={300}
                  margin={{ top: 20, right: 80, bottom: 60, left: 60 }}
                />
              </Box>
              
              {/* Humidity Chart */}
              <Box sx={{ height: 350 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  濕度趨勢
                </Typography>
                <LineChart
                  xAxis={[
                    {
                      data: chartData.timestamps,
                      scaleType: 'point',
                      valueFormatter: (value: number | null) => {
                        if (value === null || value === undefined) return '';
                        const index = Number(value);
                        if (index >= 0 && index < chartData.temperatureLabels.length) {
                          // Show fewer labels for better readability
                          if (chartData.timestamps.length > 20) {
                            return index % Math.ceil(chartData.timestamps.length / 10) === 0
                              ? chartData.temperatureLabels[index]
                              : '';
                          }
                          return chartData.temperatureLabels[index];
                        }
                        return '';
                      },
                    },
                  ]}
                  series={[
                    {
                      data: chartData.humidities,
                      label: '濕度 (%)',
                      color: '#0ea5e9',
                      curve: 'linear',
                      showMark: chartData.timestamps.length <= 50,
                      area: true,
                    },
                  ]}
                  height={300}
                  margin={{ top: 20, right: 80, bottom: 60, left: 60 }}
                />
              </Box>
            </Box>
          )}
        </Paper>

        {/* Table Section */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              詳細數據 ({tableData.length} 筆)
            </Typography>
            {tableData.length > 0 && (
              <Chip 
                label={`顯示全部 ${tableData.length} 筆記錄`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : tableData.length === 0 ? (
            <Box sx={{ 
              height: 200, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              backgroundColor: "#f8fafc",
              borderRadius: 1,
            }}>
              <Typography variant="body2" color="text.secondary">
                {selectedCompanyId ? "查詢中，請稍候..." : "請先選擇公司並設定日期範圍"}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600, border: "1px solid #e2e8f0", borderRadius: 1 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>時間</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>區域</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>感測器ID</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>溫度 (°C)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>濕度 (%)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>體感溫度 (°C)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow 
                      key={`${row.timestamp}-${row.sensor_id}-${index}`} 
                      hover
                      sx={{ 
                        '&:nth-of-type(odd)': { 
                          backgroundColor: '#fafafa' 
                        } 
                      }}
                    >
                      <TableCell>{formatTimestamp(row.timestamp)}</TableCell>
                      <TableCell>{row.area_name}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {row.sensor_id.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#f59e0b", fontWeight: 600 }}>
                        {row.temperature.toFixed(1)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#0ea5e9", fontWeight: 600 }}>
                        {row.humidity.toFixed(1)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#8b5cf6", fontWeight: 600 }}>
                        {row.heat_index.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TemperaturePage;


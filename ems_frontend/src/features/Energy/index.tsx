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
import { BarChart } from '@mui/x-charts/BarChart';
import {
  Bolt as BoltIcon,
  Home as HomeIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { actions } from "../Home/reducer";
import {
  companiesListSelector,
  selectedCompanyIdSelector,
  selectedCompanyMetersHistorySelector,
  metersLoadingSelector,
} from "../Home/selector";
import { formatTimestamp, formatDateKey } from "../../helper/utils";

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

const EnergyPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redux selectors
  const companies = useSelector(companiesListSelector);
  const selectedCompanyId = useSelector(selectedCompanyIdSelector);
  const metersHistory = useSelector(selectedCompanyMetersHistorySelector);
  const loading = useSelector(metersLoadingSelector);

  // Chart type toggle
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  // Area filter state
  const [selectedArea, setSelectedArea] = useState<string>("");

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const urlStart = searchParams.get('start');
    if (urlStart) return urlStart;
    const date = new Date();
    date.setDate(date.getDate() - 7);
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

  // Auto-query data when company or date range changes
  useEffect(() => {
    if (selectedCompanyId) {
      const startTime = convertLocalDateToUTCStart(startDate);
      const endTime = convertLocalDateToUTCEnd(endDate);

      dispatch(actions.fetchMeters({
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

    dispatch(actions.fetchMeters({
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
    metersHistory.forEach((data) => {
      if (data.area_name) areas.add(data.area_name);
    });
    return Array.from(areas).sort();
  }, [metersHistory]);

  // Filter data by selected area
  const filteredHistory = useMemo(() => {
    if (!selectedArea) return metersHistory;
    return metersHistory.filter((data) => data.area_name === selectedArea);
  }, [metersHistory, selectedArea]);

  // Per-area statistics
  const areaStatistics = useMemo(() => {
    if (metersHistory.length === 0) return [];

    const areaStats: Record<string, {
      areaName: string;
      count: number;
      totalKWh: number;
      avgKw: number;
      peakKw: number;
      latestKw: number;
      latestTimestamp: string;
    }> = {};

    metersHistory.forEach((data) => {
      const area = data.area_name || '未知區域';
      if (!areaStats[area]) {
        areaStats[area] = {
          areaName: area,
          count: 0,
          totalKWh: 0,
          avgKw: 0,
          peakKw: 0,
          latestKw: data.kw,
          latestTimestamp: data.timestamp,
        };
      }

      areaStats[area].count += 1;
      areaStats[area].totalKWh = Math.max(areaStats[area].totalKWh, data.k_wh);
      areaStats[area].avgKw += data.kw;
      areaStats[area].peakKw = Math.max(areaStats[area].peakKw, data.kw);

      // Track latest reading
      if (new Date(data.timestamp) > new Date(areaStats[area].latestTimestamp)) {
        areaStats[area].latestKw = data.kw;
        areaStats[area].latestTimestamp = data.timestamp;
      }
    });

    // Calculate averages
    Object.values(areaStats).forEach((stats) => {
      stats.avgKw = stats.avgKw / stats.count;
    });

    return Object.values(areaStats).sort((a, b) => a.areaName.localeCompare(b.areaName));
  }, [metersHistory]);

  // Aggregate energy data by day
  const chartData = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        dates: [] as string[],
        dailyKWh: [] as number[],
        avgKw: [] as number[],
        peakKw: [] as number[],
      };
    }

    const dailyData: Record<string, {
      totalKw: number;
      maxKw: number;
      maxKWh: number;
      minKWh: number;
      lastKWh: number;
      count: number;
      lastTimestamp: string;
    }> = {};

    filteredHistory.forEach((data) => {
      const dateKey = formatDateKey(data.timestamp);

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          totalKw: 0,
          maxKw: 0,
          maxKWh: data.k_wh,
          minKWh: data.k_wh,
          lastKWh: data.k_wh,
          count: 0,
          lastTimestamp: data.timestamp
        };
      }

      dailyData[dateKey].totalKw += data.kw;
      dailyData[dateKey].maxKw = Math.max(dailyData[dateKey].maxKw, data.kw);
      dailyData[dateKey].maxKWh = Math.max(dailyData[dateKey].maxKWh, data.k_wh);
      dailyData[dateKey].minKWh = Math.min(dailyData[dateKey].minKWh, data.k_wh);
      dailyData[dateKey].count += 1;

      if (new Date(data.timestamp) > new Date(dailyData[dateKey].lastTimestamp)) {
        dailyData[dateKey].lastKWh = data.k_wh;
        dailyData[dateKey].lastTimestamp = data.timestamp;
      }
    });

    const sortedDateKeys = Object.keys(dailyData).sort();

    const dailyConsumption = sortedDateKeys.map((dateKey, index) => {
      if (index === 0) {
        const dayData = dailyData[dateKey];
        return Number((dayData.maxKWh - dayData.minKWh).toFixed(1));
      }
      const previousDateKey = sortedDateKeys[index - 1];
      const todayKWh = dailyData[dateKey].lastKWh;
      const yesterdayKWh = dailyData[previousDateKey].lastKWh;
      return Number((todayKWh - yesterdayKWh).toFixed(1));
    });

    const displayDates = sortedDateKeys.map(dateKey => {
      const [, month, day] = dateKey.split('-');
      return `${month}/${day}`;
    });

    return {
      dates: displayDates,
      dailyKWh: dailyConsumption,
      avgKw: sortedDateKeys.map(dateKey => Number((dailyData[dateKey].totalKw / dailyData[dateKey].count).toFixed(1))),
      peakKw: sortedDateKeys.map(dateKey => Number(dailyData[dateKey].maxKw.toFixed(1))),
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
    if (filteredHistory.length === 0 || chartData.dailyKWh.length === 0) {
      return {
        totalConsumption: 0,
        avgDailyConsumption: 0,
        maxDailyConsumption: 0,
        avgPower: 0,
        peakPower: 0,
      };
    }

    const validConsumption = chartData.dailyKWh.filter(v => v > 0);
    const powers = filteredHistory.map((d) => d.kw);

    return {
      totalConsumption: validConsumption.reduce((a, b) => a + b, 0),
      avgDailyConsumption: validConsumption.length > 0
        ? validConsumption.reduce((a, b) => a + b, 0) / validConsumption.length
        : 0,
      maxDailyConsumption: Math.max(...chartData.dailyKWh),
      avgPower: powers.reduce((a, b) => a + b, 0) / powers.length,
      peakPower: Math.max(...powers),
    };
  }, [filteredHistory, chartData]);

  // Export CSV function
  const handleExportCSV = () => {
    if (tableData.length === 0) return;

    const headers = ['時間', '區域', '功率(kW)', '累計電量(kWh)'];
    const rows = tableData.map(row => [
      formatTimestamp(row.timestamp),
      row.area_name,
      row.kw.toFixed(2),
      row.k_wh.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `energy_data_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              <BoltIcon sx={{ color: "#f59e0b", fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                能源分析
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="返回首頁">
                <IconButton onClick={() => navigate('/')} color="primary">
                  <HomeIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="匯出 CSV">
                <IconButton onClick={handleExportCSV} disabled={tableData.length === 0} color="primary">
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
              <Chip label="1天" size="small" onClick={() => handleQuickRange(1)} sx={{ cursor: "pointer" }} />
              <Chip label="7天" size="small" onClick={() => handleQuickRange(7)} sx={{ cursor: "pointer" }} />
              <Chip label="30天" size="small" onClick={() => handleQuickRange(30)} sx={{ cursor: "pointer" }} />
              <Chip label="90天" size="small" onClick={() => handleQuickRange(90)} sx={{ cursor: "pointer" }} />
            </Box>
          </Box>
        </Paper>

        {/* Per-Area Statistics Cards */}
        {areaStatistics.length > 0 && !selectedArea && (
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <BoltIcon sx={{ color: "#f59e0b" }} />
              各區域用電概況
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {areaStatistics.map((stats) => (
                <Paper
                  key={stats.areaName}
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: "1 1 200px",
                    minWidth: 200,
                    maxWidth: 300,
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-2px)",
                    },
                  }}
                  onClick={() => setSelectedArea(stats.areaName)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {stats.areaName}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981", mb: 0.5 }}>
                    {stats.totalKWh.toFixed(1)} kWh
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      目前: {stats.latestKw.toFixed(1)} kW
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      尖峰: {stats.peakKw.toFixed(1)} kW
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    {stats.count} 筆紀錄
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        )}

        {/* Statistics Cards (for filtered data) */}
        {filteredHistory.length > 0 && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 180px", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {selectedArea ? `${selectedArea} - 總用電量` : "總用電量（全部區域）"}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981" }}>
                {statistics.totalConsumption.toFixed(1)} kWh
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 180px", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                日均用電
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0ea5e9" }}>
                {statistics.avgDailyConsumption.toFixed(1)} kWh
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 180px", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                單日最高
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                {statistics.maxDailyConsumption.toFixed(1)} kWh
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 180px", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                平均功率
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#8b5cf6" }}>
                {statistics.avgPower.toFixed(1)} kW
              </Typography>
            </Paper>
            <Paper elevation={1} sx={{ p: 2, flex: "1 1 180px", minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                尖峰功率
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#ef4444" }}>
                {statistics.peakPower.toFixed(1)} kW
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              用電趨勢
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label="柱狀圖"
                size="small"
                color={chartType === 'bar' ? 'primary' : 'default'}
                onClick={() => setChartType('bar')}
                sx={{ cursor: "pointer" }}
              />
              <Chip
                label="折線圖"
                size="small"
                color={chartType === 'line' ? 'primary' : 'default'}
                onClick={() => setChartType('line')}
                sx={{ cursor: "pointer" }}
              />
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : chartData.dates.length === 0 ? (
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
              {/* Daily Consumption Chart */}
              <Box sx={{ height: 350, mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  每日用電量 (kWh)
                </Typography>
                {chartType === 'bar' ? (
                  <BarChart
                    xAxis={[{
                      data: chartData.dates,
                      scaleType: 'band',
                    }]}
                    series={[{
                      data: chartData.dailyKWh,
                      label: '用電量 (kWh)',
                      color: '#10b981',
                    }]}
                    height={300}
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                  />
                ) : (
                  <LineChart
                    xAxis={[{
                      data: chartData.dates.map((_, i) => i),
                      scaleType: 'point',
                      valueFormatter: (value) => chartData.dates[value as number] || '',
                    }]}
                    series={[{
                      data: chartData.dailyKWh,
                      label: '用電量 (kWh)',
                      color: '#10b981',
                      curve: 'linear',
                      showMark: true,
                      area: true,
                    }]}
                    height={300}
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                  />
                )}
              </Box>

              {/* Power Chart */}
              <Box sx={{ height: 350 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  功率趨勢 (kW)
                </Typography>
                <LineChart
                  xAxis={[{
                    data: chartData.dates.map((_, i) => i),
                    scaleType: 'point',
                    valueFormatter: (value) => chartData.dates[value as number] || '',
                  }]}
                  series={[
                    {
                      data: chartData.avgKw,
                      label: '平均功率 (kW)',
                      color: '#0ea5e9',
                      curve: 'linear',
                      showMark: true,
                    },
                    {
                      data: chartData.peakKw,
                      label: '尖峰功率 (kW)',
                      color: '#ef4444',
                      curve: 'linear',
                      showMark: true,
                    },
                  ]}
                  height={300}
                  margin={{ top: 20, right: 80, bottom: 50, left: 60 }}
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
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
              >
                匯出 CSV
              </Button>
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
            <TableContainer sx={{ maxHeight: 500, border: "1px solid #e2e8f0", borderRadius: 1 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>時間</TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>區域</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>功率 (kW)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: "#f8fafc" }}>累計電量 (kWh)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.slice(0, 200).map((row, index) => (
                    <TableRow
                      key={`${row.timestamp}-${row.meter_id}-${index}`}
                      hover
                      sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}
                    >
                      <TableCell>{formatTimestamp(row.timestamp)}</TableCell>
                      <TableCell>{row.area_name}</TableCell>
                      <TableCell align="right" sx={{ color: "#0ea5e9", fontWeight: 600 }}>
                        {row.kw.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#10b981", fontWeight: 600 }}>
                        {row.k_wh.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tableData.length > 200 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              顯示前 200 筆，共 {tableData.length} 筆記錄。請匯出 CSV 查看完整數據。
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default EnergyPage;

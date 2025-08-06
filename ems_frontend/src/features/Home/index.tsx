"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { actions } from "./reducer";
import { useSelector } from "react-redux";
import {
  vrfSystemsSelector,
  vrfSensorsSelector,
  compareLoadingSelector,
  compareResultSelector,
  dataInitializedSelector,
} from "./selector";
import { ResponsiveLine } from "@nivo/line";
import type { VrfSystem } from "./types";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const vrfSystems: VrfSystem[] = useSelector(vrfSystemsSelector);
  const vrfSensors = useSelector(vrfSensorsSelector);
  const compareLoading: boolean = useSelector(compareLoadingSelector);
  const compareResult = useSelector(compareResultSelector);
  const dataInitialized: boolean = useSelector(dataInitializedSelector);

  const [customStart1, setCustomStart1] = useState<Dayjs>(
    dayjs().subtract(1, "day").startOf("day").set("hour", 8).set("minute", 50)
  );
  const [customEnd1, setCustomEnd1] = useState<Dayjs>(
    dayjs().subtract(1, "day").endOf("day").set("hour", 17).set("minute", 0)
  );
  const [customStart2, setCustomStart2] = useState<Dayjs>(
    dayjs().subtract(0, "day").startOf("day").set("hour", 8).set("minute", 50)
  );
  const [customEnd2, setCustomEnd2] = useState<Dayjs>(
    dayjs().subtract(0, "day").endOf("day").set("hour", 17).set("minute", 0)
  );
  const [selectedVrf, setSelectedVrf] = useState<string | null>(null);
  const [energySavingPeriod, setEnergySavingPeriod] = useState<
    "period1" | "period2"
  >("period2");

  useEffect(() => {
    if (!dataInitialized) {
      // dispatch(actions.fetchVrfData());
    }
  }, [dispatch, dataInitialized]);

  const handleCompare = () => {
    if (!selectedVrf) {
      alert("請先選擇 VRF 系統");
      return;
    }

    const vrfToMeterMapping: Record<string, string> = {
      "1F": "a6777f1a-4f75-4aea-bff8-05659609acb2",
      "20": "e16d8806-d17a-4f13-9d4e-f8934848b15f",
      "21": "f95e40e8-472c-4bf8-a16b-17925b8f682a",
      "22": "d5a8822b-3935-4472-afcf-98f6ad7cd558",
    };

    const selectedVrfSystem = vrfSystems.find((v) => v.id === selectedVrf);
    if (!selectedVrfSystem) {
      alert("找不到選擇的 VRF 系統");
      return;
    }

    const meterIdForVrf = vrfToMeterMapping[selectedVrfSystem.address];
    if (!meterIdForVrf) {
      alert("找不到對應的電表 ID");
      return;
    }

    dispatch(
      actions.fetchCompareData({
        vrfId: selectedVrf,
        meterId: meterIdForVrf,
        period1: {
          start: customStart1.format("YYYY-MM-DD HH:mm:ss"),
          end: customEnd1.format("YYYY-MM-DD HH:mm:ss"),
        },
        period2: {
          start: customStart2.format("YYYY-MM-DD HH:mm:ss"),
          end: customEnd2.format("YYYY-MM-DD HH:mm:ss"),
        },
        energySavingPeriod: energySavingPeriod,
      })
    );
  };

  // 型別：Nivo Line Chart 資料格式
  type NivoLineDatum = { x: any; y: number };

  const getYDomain = (
    chart1: any,
    chart2: any
  ): { min: number | "auto"; max: number | "auto" } => {
    const allData: NivoLineDatum[] = [
      ...((chart1 && chart1[0]?.data) || []),
      ...((chart2 && chart2[0]?.data) || []),
    ];
    if (allData.length === 0) return { min: "auto", max: "auto" };
    const yValues = allData
      .map((d) => (typeof d.y === "number" ? d.y : Number(d.y)))
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (yValues.length === 0) return { min: "auto", max: "auto" };
    return {
      min: Math.min(...yValues),
      max: Math.max(...yValues),
    };
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container sx={{ pt: 2, pb: isMobile ? 10 : 0 }}>
        <Box
          sx={{
            width: "100%",
            mt: 6,
            mb: 6,
            p: 3,
            bgcolor: "#fafafa",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" align="center" sx={{ mb: 4 }}>
            VRF 系統省電效果比對
          </Typography>

          {/* VRF 系統選擇 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              選擇要比對的 VRF 系統：
            </Typography>
            <Grid container spacing={2}>
              {vrfSystems.map((system) => (
                <Grid size={{ xs: 6, md: 3 }} key={system.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor:
                        selectedVrf === system.id ? "#1976d2" : "#f5f5f5",
                      color: selectedVrf === system.id ? "white" : "#333333",
                      border:
                        selectedVrf === system.id
                          ? "2px solid #1976d2"
                          : "2px solid #e0e0e0",
                      "&:hover": {
                        bgcolor:
                          selectedVrf === system.id ? "#1565c0" : "#eeeeee",
                        transform: "translateY(-2px)",
                        transition: "all 0.2s ease-in-out",
                      },
                    }}
                    onClick={() => setSelectedVrf(system.id)}
                  >
                    <Typography variant="h6">{system.address}</Typography>
                    <Typography variant="body2">
                      {(vrfSensors[system.id] || []).length} 個感測器
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 節能模式設定 */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <FormControl component="fieldset">
              <FormLabel
                component="legend"
                sx={{ mb: 2, fontWeight: "bold", color: "#333" }}
              >
                選擇哪個時間區間有開啟節能模式：
              </FormLabel>
              <RadioGroup
                row
                value={energySavingPeriod}
                onChange={(e) =>
                  setEnergySavingPeriod(e.target.value as "period1" | "period2")
                }
              >
                <FormControlLabel
                  value="period1"
                  control={<Radio />}
                  label="區間1 有節能模式"
                  sx={{ mr: 4 }}
                />
                <FormControlLabel
                  value="period2"
                  control={<Radio />}
                  label="區間2 有節能模式"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* 時間區間設定 */}
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                區間1（
                {energySavingPeriod === "period1" ? "節能模式" : "基準期間"}）
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <DateTimePicker
                  label="開始時間"
                  value={customStart1}
                  onChange={(newValue) => {
                    if (newValue) setCustomStart1(newValue);
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
                <DateTimePicker
                  label="結束時間"
                  value={customEnd1}
                  onChange={(newValue) => {
                    if (newValue) setCustomEnd1(newValue);
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                區間2（
                {energySavingPeriod === "period2" ? "節能模式" : "基準期間"}）
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
                <DateTimePicker
                  label="開始時間"
                  value={customStart2}
                  onChange={(newValue) => {
                    if (newValue) setCustomStart2(newValue);
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
                <DateTimePicker
                  label="結束時間"
                  value={customEnd2}
                  onChange={(newValue) => {
                    if (newValue) setCustomEnd2(newValue);
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: 56 }}
                onClick={handleCompare}
                disabled={!selectedVrf || compareLoading}
              >
                {compareLoading ? "比對中..." : "開始比對"}
              </Button>
            </Grid>
          </Grid>

          {/* 載入狀態顯示 */}
          {compareLoading && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="h6" color="primary">
                正在載入比對數據，請稍候...
              </Typography>
            </Box>
          )}

          {/* 比對結果顯示 */}
          {compareResult && selectedVrf && !compareLoading && (
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                {vrfSystems.find((v) => v.id === selectedVrf)?.address}{" "}
                系統比對結果
              </Typography>
              {compareResult.vrfSensorDetails &&
                compareResult.vrfSensorDetails.length > 0 && (
                  <Typography
                    variant="subtitle1"
                    align="center"
                    sx={{ mb: 4, color: "text.secondary" }}
                  >
                    {compareResult.vrfSensorDetails.length === 1
                      ? `${compareResult.vrfSensorDetails[0].ac_name} - ${compareResult.vrfSensorDetails[0].ac_location}`
                      : `${
                          compareResult.vrfSensorDetails.length
                        } 個感測器: ${compareResult.vrfSensorDetails
                          .map((s: any) => s.ac_name)
                          .join(", ")}`}
                  </Typography>
                )}

              {/* 詳細感測器列表 */}
              {compareResult.vrfSensorDetails &&
                compareResult.vrfSensorDetails.length > 1 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                      感測器詳細資訊
                    </Typography>
                    <Grid container spacing={1} justifyContent="center">
                      {compareResult.vrfSensorDetails.map((sensor: any) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sensor.id}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              textAlign: "center",
                              bgcolor: "#f8f9fa",
                            }}
                          >
                            <Typography variant="subtitle2" color="primary">
                              {sensor.ac_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {sensor.ac_location}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {sensor.temperature_sensor_address}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

              {/* 數據摘要 */}
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                綜合數據摘要
                {compareResult.vrfSensorDetails &&
                  compareResult.vrfSensorDetails.length > 1 && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      以下為 {compareResult.vrfSensorDetails.length}{" "}
                      個感測器的綜合平均數據
                    </Typography>
                  )}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#1976d2",
                      color: "white",
                    }}
                  >
                    <Typography variant="subtitle2">平均溫度變化</Typography>
                    <Typography variant="h5">
                      {compareResult.avg1}°C → {compareResult.avg2}°C
                    </Typography>
                    <Typography variant="body2">
                      {compareResult.avg2 > compareResult.avg1 ? "↑" : "↓"}
                      {Math.abs(
                        compareResult.avg2 - compareResult.avg1
                      ).toFixed(1)}
                      °C
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#2196f3",
                      color: "white",
                    }}
                  >
                    <Typography variant="subtitle2">平均濕度變化</Typography>
                    <Typography variant="h5">
                      {compareResult.avgHumidity1}% →{" "}
                      {compareResult.avgHumidity2}%
                    </Typography>
                    <Typography variant="body2">
                      {compareResult.avgHumidity2 > compareResult.avgHumidity1
                        ? "↑"
                        : "↓"}
                      {Math.abs(
                        compareResult.avgHumidity2 - compareResult.avgHumidity1
                      ).toFixed(1)}
                      %
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#ff9800",
                      color: "white",
                    }}
                  >
                    <Typography variant="subtitle2">體感溫度變化</Typography>
                    <Typography variant="h5">
                      {compareResult.avgHeatIndex1}°C →{" "}
                      {compareResult.avgHeatIndex2}°C
                    </Typography>
                    <Typography variant="body2">
                      {compareResult.avgHeatIndex2 > compareResult.avgHeatIndex1
                        ? "↑"
                        : "↓"}
                      {Math.abs(
                        compareResult.avgHeatIndex2 -
                          compareResult.avgHeatIndex1
                      ).toFixed(1)}
                      °C
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#388e3c",
                      color: "white",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={0.5}
                    >
                      <Typography variant="subtitle2">省電效果</Typography>
                      <InfoIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                    </Box>
                    <Typography variant="h5">
                      {compareResult.savingPercent > 0 ? "+" : ""}
                      {compareResult.savingPercent}%
                    </Typography>
                    <Typography variant="body2">
                      總耗電量減少 {compareResult.wattRange1.toFixed(0)}KW →{" "}
                      {compareResult.wattRange2.toFixed(0)}KW
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
                      點擊下方查看計算方式
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 2.4 }}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "#e91e63",
                      color: "white",
                    }}
                  >
                    <Typography variant="subtitle2">數據筆數</Typography>
                    <Typography variant="h5">
                      {compareResult.meterData1Count} vs{" "}
                      {compareResult.meterData2Count}
                    </Typography>
                    <Typography variant="body2">
                      溫度: {compareResult.chart1[0]?.data?.length || 0} vs{" "}
                      {compareResult.chart2[0]?.data?.length || 0}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* 計算說明 */}
              <Box sx={{ mb: 4 }}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="calculation-content"
                    id="calculation-header"
                    sx={{ bgcolor: "#f8f9fa" }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <InfoIcon color="primary" />
                      <Typography variant="h6" color="primary">
                        📊 計算方式說明
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      {/* 環境數據計算 */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                          <Typography
                            variant="h6"
                            color="primary"
                            sx={{ mb: 2 }}
                          >
                            🌡️ 環境數據計算
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              溫度平均值：
                            </Typography>
                            <Typography variant="body2">
                              將所有感測器在該時間區間的溫度讀數相加，除以總筆數
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              平均溫度 = Σ(所有溫度讀數) ÷ 讀數總數
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              濕度平均值：
                            </Typography>
                            <Typography variant="body2">
                              同溫度計算方式，取所有濕度讀數的平均值
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              體感溫度：
                            </Typography>
                            <Typography variant="body2">
                              考慮溫度和濕度的綜合舒適度指標
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* 功率數據計算 */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={1} sx={{ p: 2, bgcolor: "#fff3e0" }}>
                          <Typography
                            variant="h6"
                            color="warning.main"
                            sx={{ mb: 2 }}
                          >
                            ⚡ 功率數據計算
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              瞬間功率計算：
                            </Typography>
                            <Typography variant="body2">
                              電表記錄的是累積用電量，需轉換為瞬間功率
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              瞬間功率 = (當前累積電量 - 前一筆累積電量) ÷
                              時間差
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold" }}
                            >
                              總耗電量：
                            </Typography>
                            <Typography variant="body2">
                              該時間區間內的最大累積電量 - 最小累積電量
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* 省電效果計算 */}
                      <Grid size={{ xs: 12 }}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            bgcolor: "#e8f5e8",
                            border: "2px solid #4caf50",
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="success.main"
                            sx={{ mb: 2 }}
                          >
                            💡 省電效果計算（重點說明）
                          </Typography>
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              計算公式：
                            </Typography>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor: "white",
                                border: "1px solid #ddd",
                              }}
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontFamily: "monospace",
                                  textAlign: "center",
                                }}
                              >
                                省電百分比 = (基準期間總耗電量 -
                                節能期間總耗電量) ÷ 基準期間總耗電量 × 100%
                              </Typography>
                            </Paper>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold", color: "error.main" }}
                              >
                                基準期間總耗電量：
                              </Typography>
                              <Typography variant="body2">
                                {energySavingPeriod === "period1"
                                  ? compareResult.wattRange2.toFixed(2)
                                  : compareResult.wattRange1.toFixed(2)}
                                KW
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                (區間
                                {energySavingPeriod === "period1"
                                  ? "2"
                                  : "1"}{" "}
                                的最大累積電量 - 最小累積電量)
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: "bold",
                                  color: "primary.main",
                                }}
                              >
                                節能期間總耗電量：
                              </Typography>
                              <Typography variant="body2">
                                {energySavingPeriod === "period1"
                                  ? compareResult.wattRange1.toFixed(2)
                                  : compareResult.wattRange2.toFixed(2)}
                                KW
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                (區間
                                {energySavingPeriod === "period1"
                                  ? "1"
                                  : "2"}{" "}
                                的最大累積電量 - 最小累積電量)
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: "bold",
                                  color: "success.main",
                                }}
                              >
                                計算結果：
                              </Typography>
                              <Typography variant="body2">
                                {energySavingPeriod === "period1"
                                  ? `(${compareResult.wattRange2.toFixed(
                                      2
                                    )} - ${compareResult.wattRange1.toFixed(
                                      2
                                    )}) ÷ ${compareResult.wattRange2.toFixed(
                                      2
                                    )} × 100% = ${compareResult.savingPercent}%`
                                  : `(${compareResult.wattRange1.toFixed(
                                      2
                                    )} - ${compareResult.wattRange2.toFixed(
                                      2
                                    )}) ÷ ${compareResult.wattRange1.toFixed(
                                      2
                                    )} × 100% = ${
                                      compareResult.savingPercent
                                    }%`}
                              </Typography>
                            </Grid>
                          </Grid>

                          <Box
                            sx={{
                              mt: 3,
                              p: 2,
                              bgcolor: "#fff9c4",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              📋 意義說明：
                            </Typography>
                            <Typography variant="body2">
                              • <strong>正值</strong>
                              ：表示節能模式有效減少總耗電量，達到省電效果
                              <br />• <strong>負值</strong>
                              ：表示總耗電量增加，可能需要調整節能策略
                              <br />• <strong>總耗電量</strong>
                              ：計算期間內實際消耗的電力，越小表示越省電
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {/* 圖表比對 */}
              <Typography variant="h6" align="center" sx={{ mb: 3, mt: 2 }}>
                溫度趨勢比對
              </Typography>
              {(() => {
                const tempDomain = getYDomain(
                  compareResult.chart1,
                  compareResult.chart2
                );
                const tempMin: number | "auto" | undefined =
                  typeof tempDomain.min === "number" ||
                  tempDomain.min === "auto"
                    ? tempDomain.min
                    : undefined;
                const tempMax: number | "auto" | undefined =
                  typeof tempDomain.max === "number" ||
                  tempDomain.max === "auto"
                    ? tempDomain.max
                    : undefined;
                return (
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "error.main" }}
                        >
                          區間1 - 溫度趨勢（
                          {energySavingPeriod === "period1"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.chart1}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: tempMin,
                              max: tempMax,
                            }}
                            axisLeft={{
                              legend: "溫度 (°C)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={[theme.palette.error.main]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  溫度: {slice.points[0].data.yFormatted}°C
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "primary.main" }}
                        >
                          區間2 - 溫度趨勢（
                          {energySavingPeriod === "period2"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.chart2}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: tempMin,
                              max: tempMax,
                            }}
                            axisLeft={{
                              legend: "溫度 (°C)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={[theme.palette.primary.main]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  溫度: {slice.points[0].data.yFormatted}°C
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                );
              })()}

              {/* 濕度趨勢比對 */}
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                濕度趨勢比對
              </Typography>
              {(() => {
                const humidityDomain = getYDomain(
                  compareResult.humidityChart1,
                  compareResult.humidityChart2
                );
                const humidityMin: number | "auto" | undefined =
                  typeof humidityDomain.min === "number" ||
                  humidityDomain.min === "auto"
                    ? humidityDomain.min
                    : undefined;
                const humidityMax: number | "auto" | undefined =
                  typeof humidityDomain.max === "number" ||
                  humidityDomain.max === "auto"
                    ? humidityDomain.max
                    : undefined;
                return (
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "error.main" }}
                        >
                          區間1 - 濕度趨勢（
                          {energySavingPeriod === "period1"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.humidityChart1}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: humidityMin,
                              max: humidityMax,
                            }}
                            axisLeft={{
                              legend: "濕度 (%)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#f44336"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  濕度: {slice.points[0].data.yFormatted}%
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "primary.main" }}
                        >
                          區間2 - 濕度趨勢（
                          {energySavingPeriod === "period2"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.humidityChart2}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: humidityMin,
                              max: humidityMax,
                            }}
                            axisLeft={{
                              legend: "濕度 (%)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#1976d2"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  濕度: {slice.points[0].data.yFormatted}%
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                );
              })()}

              {/* 體感溫度趨勢比對 */}
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                體感溫度趨勢比對
              </Typography>
              {(() => {
                const heatIndexDomain = getYDomain(
                  compareResult.heatIndexChart1,
                  compareResult.heatIndexChart2
                );
                const heatIndexMin: number | "auto" | undefined =
                  typeof heatIndexDomain.min === "number" ||
                  heatIndexDomain.min === "auto"
                    ? heatIndexDomain.min
                    : undefined;
                const heatIndexMax: number | "auto" | undefined =
                  typeof heatIndexDomain.max === "number" ||
                  heatIndexDomain.max === "auto"
                    ? heatIndexDomain.max
                    : undefined;
                return (
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "error.main" }}
                        >
                          區間1 - 體感溫度趨勢（
                          {energySavingPeriod === "period1"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.heatIndexChart1}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: heatIndexMin,
                              max: heatIndexMax,
                            }}
                            axisLeft={{
                              legend: "體感溫度 (°C)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#f44336"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  體感溫度: {slice.points[0].data.yFormatted}°C
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "primary.main" }}
                        >
                          區間2 - 體感溫度趨勢（
                          {energySavingPeriod === "period2"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.heatIndexChart2}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: heatIndexMin,
                              max: heatIndexMax,
                            }}
                            axisLeft={{
                              legend: "體感溫度 (°C)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#1976d2"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  體感溫度: {slice.points[0].data.yFormatted}°C
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                );
              })()}

              {/* 用電趨勢比對 */}
              <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                瞬間功率趨勢比對
              </Typography>
              {(() => {
                const meterDomain = getYDomain(
                  compareResult.meterChart1,
                  compareResult.meterChart2
                );
                let meterMin: number | "auto" | undefined = undefined;
                if (typeof meterDomain.min === "number") {
                  meterMin = meterDomain.min < 0 ? 0 : meterDomain.min;
                } else if (meterDomain.min === "auto") {
                  meterMin = "auto";
                }
                const meterMax: number | "auto" | undefined =
                  typeof meterDomain.max === "number"
                    ? meterDomain.max
                    : meterDomain.max === "auto"
                    ? "auto"
                    : undefined;
                return (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "error.main" }}
                        >
                          區間1 - 瞬間功率趨勢（
                          {energySavingPeriod === "period1"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.meterChart1}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: meterMin,
                              max: meterMax,
                            }}
                            axisLeft={{
                              legend: "瞬間功率 (W)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#f44336"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  瞬間功率: {slice.points[0].data.yFormatted}W
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle1"
                          align="center"
                          sx={{ mb: 2, color: "primary.main" }}
                        >
                          區間2 - 瞬間功率趨勢（
                          {energySavingPeriod === "period2"
                            ? "節能模式"
                            : "基準期間"}
                          ）
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveLine
                            data={compareResult.meterChart2}
                            margin={{
                              top: 30,
                              right: 30,
                              bottom: 80,
                              left: 60,
                            }}
                            xScale={{
                              type: "time",
                              format: "native",
                              precision: "minute",
                            }}
                            yScale={{
                              type: "linear",
                              min: meterMin,
                              max: meterMax,
                            }}
                            axisLeft={{
                              legend: "瞬間功率 (W)",
                              legendOffset: -45,
                              legendPosition: "middle",
                              tickSize: 5,
                              tickPadding: 5,
                            }}
                            axisBottom={{
                              format: "%H:%M",
                              legend: "時間",
                              legendOffset: 45,
                              legendPosition: "middle",
                              tickRotation: -45,
                              tickSize: 5,
                              tickPadding: 5,
                              tickValues: "every 30 minutes",
                            }}
                            colors={["#1976d2"]}
                            enableGridX={true}
                            enableGridY={true}
                            gridXValues={10}
                            gridYValues={5}
                            pointSize={4}
                            lineWidth={2}
                            enableArea={true}
                            areaOpacity={0.1}
                            useMesh={true}
                            animate={true}
                            motionConfig="gentle"
                            enableSlices="x"
                            sliceTooltip={({ slice }) => (
                              <div
                                style={{
                                  background: "white",
                                  padding: "9px 12px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <div>
                                  時間: {slice.points[0].data.xFormatted}
                                </div>
                                <div>
                                  瞬間功率: {slice.points[0].data.yFormatted}W
                                </div>
                              </div>
                            )}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                );
              })()}
            </Box>
          )}

          {/* 提示訊息 */}
          {!selectedVrf && (
            <Box sx={{ mt: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                請先選擇要比對的 VRF 系統
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

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
              <SearchBox>
                <SearchIcon sx={{ color: "text.secondary" }} />
                <InputBase
                  placeholder="搜尋..."
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </SearchBox>
              <Chip
                icon={<span>🌱</span>}
                label="ESG 績效良好"
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
                AM
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
          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  25.4{" "}
                  <Typography component="span" variant="h6">
                    kWh
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  今日用電量
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TrendingDownIcon
                    sx={{ color: "error.main", fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "error.main", fontWeight: 500 }}
                  >
                    12.5% 較昨日
                  </Typography>
                </Box>
              </Box>
            </StatCard>
          </Box>

          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  3.8{" "}
                  <Typography component="span" variant="h6">
                    噸
                  </Typography>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  本月碳排放
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <TrendingDownIcon
                    sx={{ color: "success.main", fontSize: 16 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: "success.main", fontWeight: 500 }}
                  >
                    8.2% 較上月
                  </Typography>
                </Box>
              </Box>
            </StatCard>
          </Box>

          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  24.8{" "}
                  <Typography component="span" variant="h6">
                    °C
                  </Typography>
                </Typography>
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

          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
            <StatCard elevation={1}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  14 / 16
                </Typography>
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
                    所有系統正常
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  能源使用趨勢
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select defaultValue="daily" displayEmpty>
                    <MenuItem value="daily">日檢視</MenuItem>
                    <MenuItem value="weekly">週檢視</MenuItem>
                    <MenuItem value="monthly">月檢視</MenuItem>
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                環境數據
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  室外溫度
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  32.5 °C
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={85}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  平均濕度
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  68 %
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={68}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  空氣品質
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  良好
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={60}
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ESG 績效指標
              </Typography>
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
                      78%
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
                      <Typography variant="body2">減碳量 (噸)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        15.6 / 20
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={78}
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
                        22.4 / 25
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={89.6}
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
                        8.3 / 15
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={55.3}
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
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                節能最佳實踐
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "rgba(14, 165, 233, 0.1)",
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

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
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
                      設定最佳舒適溫度區間，避免過度製冷/製熱，建議夏季設定
                      26°C。
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              設備狀態
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select defaultValue="all" displayEmpty>
                <MenuItem value="all">全部設備</MenuItem>
                <MenuItem value="group1">第一群組</MenuItem>
                <MenuItem value="group2">第二群組</MenuItem>
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
            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <DeviceCard elevation={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AC-101
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  23°C
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    冷氣模式
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    風速：中
                  </Typography>
                </Box>
              </DeviceCard>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <DeviceCard elevation={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AC-102
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  24°C
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    冷氣模式
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    風速：低
                  </Typography>
                </Box>
              </DeviceCard>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <DeviceCard elevation={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AC-201
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#94a3b8",
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  --
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    已關閉
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    排程中
                  </Typography>
                </Box>
              </DeviceCard>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <DeviceCard elevation={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AC-202
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  25°C
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    省電模式
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    風速：自動
                  </Typography>
                </Box>
              </DeviceCard>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default HomePage;

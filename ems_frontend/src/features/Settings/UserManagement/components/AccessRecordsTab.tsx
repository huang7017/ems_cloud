import React, { useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Box,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

// 假資料 - 存取記錄
const fakeAccessRecords = [
  {
    id: 1,
    userId: "user001",
    userName: "王大明",
    action: "login",
    actionName: "登入",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    timestamp: "2024-01-15 14:30:25",
    status: "success",
    details: "成功登入系統",
  },
  {
    id: 2,
    userId: "user002",
    userName: "林小華",
    action: "logout",
    actionName: "登出",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox 121.0.0.0",
    timestamp: "2024-01-15 14:25:10",
    status: "success",
    details: "正常登出",
  },
  {
    id: 3,
    userId: "user003",
    userName: "張明輝",
    action: "page_access",
    actionName: "頁面存取",
    ipAddress: "192.168.1.102",
    userAgent: "Safari 17.2.0",
    timestamp: "2024-01-15 14:20:15",
    status: "success",
    details: "存取用戶管理頁面",
  },
  {
    id: 4,
    userId: "user001",
    userName: "王大明",
    action: "data_export",
    actionName: "資料匯出",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    timestamp: "2024-01-15 14:15:30",
    status: "success",
    details: "匯出用戶資料",
  },
  {
    id: 5,
    userId: "user004",
    userName: "李芳華",
    action: "login",
    actionName: "登入",
    ipAddress: "192.168.1.103",
    userAgent: "Edge 120.0.0.0",
    timestamp: "2024-01-15 14:10:45",
    status: "failed",
    details: "密碼錯誤",
  },
  {
    id: 6,
    userId: "user002",
    userName: "林小華",
    action: "permission_change",
    actionName: "權限變更",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox 121.0.0.0",
    timestamp: "2024-01-15 14:05:20",
    status: "success",
    details: "修改用戶權限設定",
  },
  {
    id: 7,
    userId: "user003",
    userName: "張明輝",
    action: "data_delete",
    actionName: "資料刪除",
    ipAddress: "192.168.1.102",
    userAgent: "Safari 17.2.0",
    timestamp: "2024-01-15 14:00:10",
    status: "success",
    details: "刪除測試資料",
  },
  {
    id: 8,
    userId: "user001",
    userName: "王大明",
    action: "system_config",
    actionName: "系統設定",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    timestamp: "2024-01-15 13:55:30",
    status: "success",
    details: "修改系統參數",
  },
];

const AccessRecordsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  // 篩選記錄
  const filteredRecords = fakeAccessRecords.filter((record) => {
    const matchesSearch =
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.actionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ipAddress.includes(searchTerm) ||
      record.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesAction =
      actionFilter === "all" || record.action === actionFilter;

    return matchesSearch && matchesStatus && matchesAction;
  });

  // 分頁處理
  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "成功";
      case "failed":
        return "失敗";
      case "warning":
        return "警告";
      default:
        return "未知";
    }
  };

  return (
    <Box>
      {/* 標題和篩選搜索在同一行 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* 標題區域 */}
          <Box sx={{ minWidth: { xs: "100%", sm: "auto" } }}>
            <Typography variant="h5" gutterBottom={false}>
              存取記錄
            </Typography>
            <Typography variant="body2" color="text.secondary">
              共 {filteredRecords.length} 筆記錄
            </Typography>
          </Box>

          {/* 間距 */}
          <Box sx={{ flex: 1 }} />

          {/* 篩選和搜索區域 */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              flex: { xs: "none", sm: "1" },
            }}
          >
            <TextField
              placeholder="搜尋用戶、動作或 IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ flex: 1, minWidth: { xs: "100%", sm: 200 } }}
            />
            <FormControl sx={{ minWidth: { xs: "100%", sm: 120 } }}>
              <InputLabel>狀態</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="狀態"
              >
                <MenuItem value="all">全部狀態</MenuItem>
                <MenuItem value="success">成功</MenuItem>
                <MenuItem value="failed">失敗</MenuItem>
                <MenuItem value="warning">警告</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 120 } }}>
              <InputLabel>動作類型</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="動作類型"
              >
                <MenuItem value="all">全部動作</MenuItem>
                <MenuItem value="login">登入</MenuItem>
                <MenuItem value="logout">登出</MenuItem>
                <MenuItem value="page_access">頁面存取</MenuItem>
                <MenuItem value="data_export">資料匯出</MenuItem>
                <MenuItem value="permission_change">權限變更</MenuItem>
                <MenuItem value="data_delete">資料刪除</MenuItem>
                <MenuItem value="system_config">系統設定</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="匯出記錄">
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* 記錄表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用戶</TableCell>
              <TableCell>動作</TableCell>
              <TableCell>IP 位址</TableCell>
              <TableCell>時間</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>詳細資訊</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {record.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.userId}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={record.actionName}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {record.ipAddress}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{record.timestamp}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(record.status)}
                    color={
                      getStatusColor(record.status) as
                        | "success"
                        | "error"
                        | "warning"
                        | "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {record.details}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="查看詳細">
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      <TablePagination
        component="div"
        count={filteredRecords.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage="每頁顯示："
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Box>
  );
};

export default AccessRecordsTab;

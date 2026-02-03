import React, { useState, useEffect } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
} from "@mui/icons-material";
import { fetchAuditLogsApi } from "../../../../api/auditLog";
import type { AuditLog } from "../../../../api/auditLog";

const AccessRecordsTab: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [records, setRecords] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 獲取審計日誌
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await fetchAuditLogsApi({
          limit: rowsPerPage,
          offset: page * rowsPerPage,
          status: statusFilter === "all" ? undefined : statusFilter,
          action: actionFilter === "all" ? undefined : actionFilter,
        });

        if (response.success && Array.isArray(response.data)) {
          setRecords(response.data);
          // Use pagination total if available, otherwise fall back to data.length
          setTotalCount((response as any).pagination?.total || response.data.length);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, rowsPerPage, statusFilter, actionFilter]);

  // 篩選記錄（前端搜索）
  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      record.member_id?.toString().includes(searchLower) ||
      record.action?.toLowerCase().includes(searchLower) ||
      record.resource_type?.toLowerCase().includes(searchLower) ||
      record.ip_address?.includes(searchLower)
    );
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "success";
      case "FAILURE":
      case "FAILED":
        return "error";
      case "WARNING":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "成功";
      case "FAILURE":
      case "FAILED":
        return "失敗";
      case "WARNING":
        return "警告";
      default:
        return "未知";
    }
  };

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      CREATE: "創建",
      UPDATE: "更新",
      DELETE: "刪除",
      ASSIGN_POWERS: "分配權限",
      REMOVE_POWERS: "移除權限",
      ASSIGN_MEMBERS: "分配成員",
      REMOVE_MEMBERS: "移除成員",
      UPDATE_STATUS: "更新狀態",
    };
    return actionMap[action] || action;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
              placeholder="搜尋成員、動作或 IP..."
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
                <MenuItem value="SUCCESS">成功</MenuItem>
                <MenuItem value="FAILURE">失敗</MenuItem>
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
                <MenuItem value="CREATE">創建</MenuItem>
                <MenuItem value="UPDATE">更新</MenuItem>
                <MenuItem value="DELETE">刪除</MenuItem>
                <MenuItem value="ASSIGN_POWERS">分配權限</MenuItem>
                <MenuItem value="UPDATE_STATUS">更新狀態</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* 記錄表格 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>成員ID</TableCell>
              <TableCell>動作</TableCell>
              <TableCell>資源</TableCell>
              <TableCell>IP 位址</TableCell>
              <TableCell>時間</TableCell>
              <TableCell>狀態</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    暫無記錄
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {record.member_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getActionText(record.action)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {record.resource_type}
                      </Typography>
                      {record.resource_id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {record.resource_id}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {record.ip_address || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(record.create_time)}
                    </Typography>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 分頁 */}
      <TablePagination
        component="div"
        count={totalCount}
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

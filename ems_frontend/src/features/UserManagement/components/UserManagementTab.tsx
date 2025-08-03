import React from "react";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Paper,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { User } from "../types";

interface UserManagementTabProps {
  users: User[];
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEditUser: (user: User) => void;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  searchTerm,
  onSearchChange,
  onEditUser,
}) => {
  const getStatusColor = (status: string) => {
    return status === "enabled" ? "success" : "default";
  };

  const getRoleColor = (role: string) => {
    return role === "管理員" ? "primary" : "secondary";
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            maxWidth: { xs: "100%", sm: 400 },
            minWidth: { xs: "auto", sm: 200 },
            width: "100%",
          }}
        >
          <TextField
            placeholder="搜尋用戶..."
            value={searchTerm}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ flex: 1 }}
            size="small"
          />
        </Box>
      </Box>

      {/* Users List Section */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Desktop Table View */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <TableContainer
            component={Paper}
            sx={{
              height: "100%",
              overflow: "auto",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>用戶名稱</TableCell>
                  <TableCell>電子郵件</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>最後登入</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {user.avatar}
                        </Avatar>
                        <Box sx={{ fontWeight: "medium" }}>{user.name}</Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={
                          getRoleColor(user.role) as "primary" | "secondary"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.status === "enabled" ? "● 啟用中" : "● 停用中"
                        }
                        color={
                          getStatusColor(user.status) as "success" | "default"
                        }
                        size="small"
                        icon={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                user.status === "enabled"
                                  ? "success.main"
                                  : "grey.500",
                            }}
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          onClick={() => onEditUser(user)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Mobile Card View */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {users.map((user) => (
              <Paper
                key={user.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                      {user.avatar}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton onClick={() => onEditUser(user)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      角色
                    </Typography>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as "primary" | "secondary"}
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      狀態
                    </Typography>
                    <Chip
                      label={
                        user.status === "enabled" ? "● 啟用中" : "● 停用中"
                      }
                      color={
                        getStatusColor(user.status) as "success" | "default"
                      }
                      size="small"
                      icon={
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              user.status === "enabled"
                                ? "success.main"
                                : "grey.500",
                          }}
                        />
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      最後登入
                    </Typography>
                    <Typography variant="body2">{user.lastLogin}</Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserManagementTab;

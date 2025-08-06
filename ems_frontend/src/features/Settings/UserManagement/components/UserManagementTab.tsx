import React from "react";
import {
  Box,
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
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { User } from "../types";

interface UserManagementTabProps {
  users: User[];
  onEditUser: (user: User) => void;
  translate: (key: string) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onEditUser,
  translate,
}) => {
  const getStatusColor = (status: string) => {
    return status === "enabled" ? "success" : "default";
  };

  const getRoleColor = (role: string) => {
    return role === "管理員" ? "primary" : "secondary";
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
                  <TableCell>{translate("username")}</TableCell>
                  <TableCell>{translate("email")}</TableCell>
                  <TableCell>{translate("role")}</TableCell>
                  <TableCell>{translate("status")}</TableCell>
                  <TableCell>{translate("last_login")}</TableCell>
                  <TableCell>{translate("actions")}</TableCell>
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
                          user.status === "enabled"
                            ? translate("enabled")
                            : translate("disabled")
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
                      {translate("role")}
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
                      {translate("status")}
                    </Typography>
                    <Chip
                      label={
                        user.status === "enabled"
                          ? translate("enabled")
                          : translate("disabled")
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
                      {translate("last_login")}
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

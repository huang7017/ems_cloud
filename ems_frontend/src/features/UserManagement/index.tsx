"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "./reducer";
import {
  filteredUsersSelector,
  rolesSelector,
  searchTermSelector,
} from "./selector";
import type { User, Role } from "./types";
import {
  TabPanel,
  UserDialog,
  RoleDialog,
  UserManagementTab,
  RolePermissionsTab,
  AccessRecordsTab,
} from "./components";

const UserManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const users = useSelector(filteredUsersSelector);
  const roles = useSelector(rolesSelector);
  const searchTerm = useSelector(searchTermSelector);

  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    dispatch(actions.fetchUsers());
    dispatch(actions.fetchRoles());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabNames = ["users", "roles", "access"] as const;
    dispatch(actions.setActiveTab(tabNames[newValue]));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.setSearchTerm(event.target.value));
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenUserDialog(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setOpenRoleDialog(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setOpenRoleDialog(true);
  };

  const handlePermissionChange = (
    roleId: string,
    permissionId: string,
    checked: boolean
  ) => {
    dispatch(actions.updatePermission({ roleId, permissionId, checked }));
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: { xs: 1, sm: 2, md: 3 },
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: {
              xs: "1.25rem",
              sm: "1.5rem",
            },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          用戶權限管理
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "row", sm: "row" },
          }}
        >
          {/* Show buttons based on active tab */}
          {tabValue === 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateUser}
              sx={{
                display: { xs: "none", sm: "flex" },
              }}
            >
              新增用戶
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateRole}
              sx={{
                display: { xs: "none", sm: "flex" },
              }}
            >
              新增角色
            </Button>
          )}
        </Box>

        {/* Mobile buttons */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            gap: 1,
            justifyContent: "center",
            mt: 2,
          }}
        >
          {tabValue === 0 && (
            <Button variant="contained" size="small" onClick={handleCreateUser}>
              新增用戶
            </Button>
          )}
          {tabValue === 1 && (
            <Button variant="contained" size="small" onClick={handleCreateRole}>
              新增角色
            </Button>
          )}
        </Box>
      </Box>

      <Paper
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: { xs: 1, sm: 2 },
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
            "& .MuiTab-root": {
              minWidth: { xs: "auto", sm: 120 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        >
          <Tab label="用戶管理" />
          <Tab label="角色權限" />
          <Tab label="存取記錄" />
        </Tabs>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <TabPanel value={tabValue} index={0}>
            <UserManagementTab
              users={users}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onEditUser={handleEditUser}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <RolePermissionsTab
              roles={roles}
              onEditRole={handleEditRole}
              onPermissionChange={handlePermissionChange}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <AccessRecordsTab />
          </TabPanel>
        </Box>
      </Paper>

      {/* User Dialog */}
      <UserDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        user={editingUser}
        roles={roles}
        onSubmit={(userData) => {
          if (editingUser) {
            dispatch(actions.updateUser({ ...editingUser, ...userData }));
          } else {
            dispatch(
              actions.createUser(
                userData as Omit<User, "id" | "lastLogin" | "avatar">
              )
            );
          }
          setOpenUserDialog(false);
        }}
      />

      {/* Role Dialog */}
      <RoleDialog
        open={openRoleDialog}
        onClose={() => setOpenRoleDialog(false)}
        role={editingRole}
        onSubmit={(roleData) => {
          if (editingRole) {
            dispatch(actions.updateRole({ ...editingRole, ...roleData }));
          } else {
            dispatch(actions.createRole(roleData as Omit<Role, "id">));
          }
          setOpenRoleDialog(false);
        }}
      />
    </Box>
  );
};

export default UserManagementPage;

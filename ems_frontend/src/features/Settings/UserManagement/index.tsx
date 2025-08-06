"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BadgeIcon from "@mui/icons-material/Badge";

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
import { t } from "../../../helper/i18n";

interface PageProps {
  lng: string;
}
const UserManagementPage: React.FC<PageProps> = ({ lng }) => {
  const dispatch = useDispatch();
  // 使用傳入的lng參數進行翻譯
  const translate = (key: string) => t(key, lng);
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
        minHeight: "100%",
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
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: "2rem" }} />
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
            {translate("user_management")}
          </Typography>
        </Box>

        {/* Search Field - Only show for Users tab */}
        {tabValue === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: { xs: "100%", sm: 300 },
              minWidth: { xs: "auto", sm: 200 },
              width: "100%",
            }}
          >
            <TextField
              placeholder={translate("search_users")}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ flex: 1 }}
              size="small"
            />
          </Box>
        )}

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
              startIcon={<PersonAddIcon />}
            >
              {translate("add_user")}
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
              startIcon={<BadgeIcon />}
            >
              {translate("add_role")}
            </Button>
          )}
        </Box>

        {/* Mobile buttons */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            gap: 1,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {tabValue === 0 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateUser}
              startIcon={<PersonAddIcon />}
              fullWidth
            >
              {translate("add_user")}
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateRole}
              startIcon={<BadgeIcon />}
              sx={{ width: "100%" }}
              fullWidth
            >
              {translate("add_role")}
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
          <Tab label={translate("user_management_tab")} />
          <Tab label={translate("role_permissions_tab")} />
          <Tab label={translate("access_records_tab")} />
        </Tabs>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <TabPanel value={tabValue} index={0}>
            <UserManagementTab
              users={users}
              onEditUser={handleEditUser}
              translate={translate}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <RolePermissionsTab
              roles={roles}
              onEditRole={handleEditRole}
              onPermissionChange={handlePermissionChange}
              translate={translate}
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

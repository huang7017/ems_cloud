import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserManagementState, User, Role } from "./types";

const initialState: UserManagementState = {
  users: [],
  roles: [],
  loading: false,
  error: null,
  activeTab: "users",
  searchTerm: "",
};

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // User actions
    fetchUsers: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.loading = false;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    createUser: (
      state,
      action: PayloadAction<Omit<User, "id" | "lastLogin" | "avatar">>
    ) => {
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      state.loading = false;
    },
    createUserFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(
        (user) => user.id === action.payload.id
      );
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      state.loading = false;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    deleteUser: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((user) => user.id !== action.payload);
      state.loading = false;
    },
    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Role actions
    fetchRoles: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRolesSuccess: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      state.loading = false;
    },
    fetchRolesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    createRole: (state, action: PayloadAction<Omit<Role, "id">>) => {
      state.loading = true;
      state.error = null;
    },
    createRoleSuccess: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
      state.loading = false;
    },
    createRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    updateRole: (state, action: PayloadAction<Role>) => {
      state.loading = true;
      state.error = null;
    },
    updateRoleSuccess: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(
        (role) => role.id === action.payload.id
      );
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
      state.loading = false;
    },
    updateRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    deleteRole: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteRoleSuccess: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter((role) => role.id !== action.payload);
      state.loading = false;
    },
    deleteRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // UI actions
    setActiveTab: (
      state,
      action: PayloadAction<"users" | "roles" | "access">
    ) => {
      state.activeTab = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    // Permission actions
    updatePermission: (
      state,
      action: PayloadAction<{
        roleId: string;
        permissionId: string;
        checked: boolean;
      }>
    ) => {
      const { roleId, permissionId, checked } = action.payload;
      const role = state.roles.find((r) => r.id === roleId);
      if (role) {
        const permission = role.permissions.find((p) => p.id === permissionId);
        if (permission) {
          permission.checked = checked;
        }
      }
    },
  },
});

export const actions = userManagementSlice.actions;
export const reducer = userManagementSlice.reducer;

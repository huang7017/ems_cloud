import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RoleManagementState, Role, Power, MenuItem, RoleRequest } from "./types";

const initialState: RoleManagementState = {
  roles: [],
  allPowers: [],
  menus: [],
  selectedRole: null,
  selectedPowerIds: [],
  loading: false,
  loadingPermissions: false,
  savingPermissions: false,
  error: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

const roleManagementSlice = createSlice({
  name: "roleManagement",
  initialState,
  reducers: {
    // Fetch roles
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
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Create role
    createRole: (state, _action: PayloadAction<RoleRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createRoleSuccess: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "角色創建成功",
        severity: "success",
      };
    },
    createRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Update role
    updateRole: (state, _action: PayloadAction<RoleRequest>) => {
      state.loading = true;
      state.error = null;
    },
    updateRoleSuccess: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex((role) => role.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "角色更新成功",
        severity: "success",
      };
    },
    updateRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Delete role
    deleteRole: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deleteRoleSuccess: (state, action: PayloadAction<number>) => {
      state.roles = state.roles.filter((role) => role.id !== action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "角色刪除成功",
        severity: "success",
      };
    },
    deleteRoleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Fetch powers and menus for permissions dialog
    fetchPowersAndMenus: (state) => {
      state.loadingPermissions = true;
    },
    fetchPowersAndMenusSuccess: (
      state,
      action: PayloadAction<{ powers: Power[]; menus: MenuItem[] }>
    ) => {
      state.allPowers = action.payload.powers;
      state.menus = action.payload.menus;
      state.loadingPermissions = false;
    },
    fetchPowersAndMenusFailure: (state, action: PayloadAction<string>) => {
      state.loadingPermissions = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Fetch role powers
    fetchRolePowers: (state, _action: PayloadAction<number>) => {
      state.loadingPermissions = true;
    },
    fetchRolePowersSuccess: (state, action: PayloadAction<number[]>) => {
      state.selectedPowerIds = action.payload;
      state.loadingPermissions = false;
    },
    fetchRolePowersFailure: (state, action: PayloadAction<string>) => {
      state.loadingPermissions = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Assign powers to role
    assignPowers: (
      state,
      _action: PayloadAction<{ roleId: number; powerIds: number[] }>
    ) => {
      state.savingPermissions = true;
    },
    assignPowersSuccess: (state) => {
      state.savingPermissions = false;
      state.snackbar = {
        open: true,
        message: "權限保存成功",
        severity: "success",
      };
    },
    assignPowersFailure: (state, action: PayloadAction<string>) => {
      state.savingPermissions = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // UI actions
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    setSelectedPowerIds: (state, action: PayloadAction<number[]>) => {
      state.selectedPowerIds = action.payload;
    },
    togglePower: (state, action: PayloadAction<number>) => {
      const powerId = action.payload;
      if (state.selectedPowerIds.includes(powerId)) {
        state.selectedPowerIds = state.selectedPowerIds.filter((id) => id !== powerId);
      } else {
        state.selectedPowerIds.push(powerId);
      }
    },
    clearSelectedPowerIds: (state) => {
      state.selectedPowerIds = [];
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const actions = roleManagementSlice.actions;
export const reducer = roleManagementSlice.reducer;
export default roleManagementSlice.reducer;

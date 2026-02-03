import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PowerManagementState, Power, MenuItem, PowerRequest } from "./types";

const initialState: PowerManagementState = {
  powers: [],
  menus: [],
  loading: false,
  error: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

const powerManagementSlice = createSlice({
  name: "powerManagement",
  initialState,
  reducers: {
    // Fetch powers
    fetchPowers: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPowersSuccess: (state, action: PayloadAction<Power[]>) => {
      state.powers = action.payload;
      state.loading = false;
    },
    fetchPowersFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Fetch menus
    fetchMenus: (state) => {
      state.loading = true;
    },
    fetchMenusSuccess: (state, action: PayloadAction<MenuItem[]>) => {
      state.menus = action.payload;
      state.loading = false;
    },
    fetchMenusFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Create power
    createPower: (state, _action: PayloadAction<PowerRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createPowerSuccess: (state, action: PayloadAction<Power>) => {
      state.powers.push(action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "權限創建成功",
        severity: "success",
      };
    },
    createPowerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Update power
    updatePower: (state, _action: PayloadAction<PowerRequest>) => {
      state.loading = true;
      state.error = null;
    },
    updatePowerSuccess: (state, action: PayloadAction<Power>) => {
      const index = state.powers.findIndex((power) => power.id === action.payload.id);
      if (index !== -1) {
        state.powers[index] = action.payload;
      }
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "權限更新成功",
        severity: "success",
      };
    },
    updatePowerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Delete power
    deletePower: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deletePowerSuccess: (state, action: PayloadAction<number>) => {
      state.powers = state.powers.filter((power) => power.id !== action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "權限刪除成功",
        severity: "success",
      };
    },
    deletePowerFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // UI actions
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const actions = powerManagementSlice.actions;
export const reducer = powerManagementSlice.reducer;
export default powerManagementSlice.reducer;

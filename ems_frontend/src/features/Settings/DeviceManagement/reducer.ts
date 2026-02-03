import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DeviceManagementState, Device, DeviceRequest } from "./types";

const initialState: DeviceManagementState = {
  devices: [],
  loading: false,
  error: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

const deviceManagementSlice = createSlice({
  name: "deviceManagement",
  initialState,
  reducers: {
    // Fetch devices
    fetchDevices: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDevicesSuccess: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.loading = false;
    },
    fetchDevicesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Create device
    createDevice: (state, _action: PayloadAction<DeviceRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createDeviceSuccess: (state, action: PayloadAction<Device>) => {
      state.devices.unshift(action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "設備創建成功",
        severity: "success",
      };
    },
    createDeviceFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Update device
    updateDevice: (state, _action: PayloadAction<{ id: number; data: DeviceRequest }>) => {
      state.loading = true;
      state.error = null;
    },
    updateDeviceSuccess: (state, action: PayloadAction<Device>) => {
      const index = state.devices.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = action.payload;
      }
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "設備更新成功",
        severity: "success",
      };
    },
    updateDeviceFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Delete device
    deleteDevice: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deleteDeviceSuccess: (state, action: PayloadAction<number>) => {
      state.devices = state.devices.filter((d) => d.id !== action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "設備刪除成功",
        severity: "success",
      };
    },
    deleteDeviceFailure: (state, action: PayloadAction<string>) => {
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

export const actions = deviceManagementSlice.actions;
export const reducer = deviceManagementSlice.reducer;
export default deviceManagementSlice.reducer;

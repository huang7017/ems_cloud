import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ScheduleManagementState, Schedule } from "./types";
import type { ScheduleRequest } from "../../../api/schedule";

const initialState: ScheduleManagementState = {
  schedule: null,
  loading: false,
  saving: false,
  syncing: false,
  error: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

const scheduleManagementSlice = createSlice({
  name: "scheduleManagement",
  initialState,
  reducers: {
    // Fetch schedule
    fetchSchedule: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    fetchScheduleSuccess: (state, action: PayloadAction<Schedule>) => {
      state.schedule = action.payload;
      state.loading = false;
    },
    fetchScheduleFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    fetchScheduleNotFound: (state) => {
      state.schedule = null;
      state.loading = false;
    },

    // Create schedule
    createSchedule: (state, _action: PayloadAction<ScheduleRequest>) => {
      state.saving = true;
      state.error = null;
    },
    createScheduleSuccess: (state, action: PayloadAction<Schedule>) => {
      state.schedule = action.payload;
      state.saving = false;
      state.snackbar = {
        open: true,
        message: "排程創建成功",
        severity: "success",
      };
    },
    createScheduleFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Update schedule
    updateSchedule: (
      state,
      _action: PayloadAction<{ companyDeviceId: number; data: ScheduleRequest }>
    ) => {
      state.saving = true;
      state.error = null;
    },
    updateScheduleSuccess: (state, action: PayloadAction<Schedule>) => {
      state.schedule = action.payload;
      state.saving = false;
      state.snackbar = {
        open: true,
        message: "排程更新成功",
        severity: "success",
      };
    },
    updateScheduleFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Delete schedule
    deleteSchedule: (state, _action: PayloadAction<number>) => {
      state.saving = true;
      state.error = null;
    },
    deleteScheduleSuccess: (state) => {
      state.schedule = null;
      state.saving = false;
      state.snackbar = {
        open: true,
        message: "排程刪除成功",
        severity: "success",
      };
    },
    deleteScheduleFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Sync schedule
    syncSchedule: (state, _action: PayloadAction<number>) => {
      state.syncing = true;
      state.error = null;
    },
    syncScheduleSuccess: (state) => {
      state.syncing = false;
      if (state.schedule) {
        state.schedule.sync_status = "synced";
      }
      state.snackbar = {
        open: true,
        message: "排程同步成功",
        severity: "success",
      };
    },
    syncScheduleFailure: (state, action: PayloadAction<string>) => {
      state.syncing = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // Query schedule from device
    queryScheduleFromDevice: (state, _action: PayloadAction<number>) => {
      state.syncing = true;
      state.error = null;
    },
    queryScheduleFromDeviceSuccess: (state) => {
      state.syncing = false;
      state.snackbar = {
        open: true,
        message: "正在從設備獲取排程...",
        severity: "info",
      };
    },
    queryScheduleFromDeviceFailure: (state, action: PayloadAction<string>) => {
      state.syncing = false;
      state.snackbar = {
        open: true,
        message: action.payload,
        severity: "error",
      };
    },

    // UI actions
    clearSchedule: (state) => {
      state.schedule = null;
      state.error = null;
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
  },
});

export const {
  fetchSchedule,
  fetchScheduleSuccess,
  fetchScheduleFailure,
  fetchScheduleNotFound,
  createSchedule,
  createScheduleSuccess,
  createScheduleFailure,
  updateSchedule,
  updateScheduleSuccess,
  updateScheduleFailure,
  deleteSchedule,
  deleteScheduleSuccess,
  deleteScheduleFailure,
  syncSchedule,
  syncScheduleSuccess,
  syncScheduleFailure,
  queryScheduleFromDevice,
  queryScheduleFromDeviceSuccess,
  queryScheduleFromDeviceFailure,
  clearSchedule,
  closeSnackbar,
} = scheduleManagementSlice.actions;

export default scheduleManagementSlice.reducer;

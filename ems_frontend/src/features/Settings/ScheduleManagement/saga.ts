import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as api from "../../../api/schedule";
import type { ScheduleRequest, Schedule } from "../../../api/schedule";
import {
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
} from "./reducer";

// Fetch schedule
function* handleFetchSchedule(action: PayloadAction<number>) {
  try {
    const schedule: Schedule = yield call(api.fetchSchedule, action.payload);
    yield put(fetchScheduleSuccess(schedule));
  } catch (error: unknown) {
    const err = error as { response?: { status?: number }; message?: string };
    if (err.response?.status === 404) {
      yield put(fetchScheduleNotFound());
    } else {
      yield put(fetchScheduleFailure(err.message || "獲取排程失敗"));
    }
  }
}

// Create schedule
function* handleCreateSchedule(action: PayloadAction<ScheduleRequest>) {
  try {
    const schedule: Schedule = yield call(api.createSchedule, action.payload);
    yield put(createScheduleSuccess(schedule));
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    yield put(
      createScheduleFailure(err.response?.data?.error || err.message || "創建排程失敗")
    );
  }
}

// Update schedule
function* handleUpdateSchedule(
  action: PayloadAction<{ companyDeviceId: number; data: ScheduleRequest }>
) {
  try {
    const schedule: Schedule = yield call(
      api.updateSchedule,
      action.payload.companyDeviceId,
      action.payload.data
    );
    yield put(updateScheduleSuccess(schedule));
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    yield put(
      updateScheduleFailure(err.response?.data?.error || err.message || "更新排程失敗")
    );
  }
}

// Delete schedule
function* handleDeleteSchedule(action: PayloadAction<number>) {
  try {
    yield call(api.deleteSchedule, action.payload);
    yield put(deleteScheduleSuccess());
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    yield put(
      deleteScheduleFailure(err.response?.data?.error || err.message || "刪除排程失敗")
    );
  }
}

// Sync schedule
function* handleSyncSchedule(action: PayloadAction<number>) {
  try {
    yield call(api.syncSchedule, action.payload);
    yield put(syncScheduleSuccess());
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    yield put(
      syncScheduleFailure(err.response?.data?.error || err.message || "同步排程失敗")
    );
  }
}

// Query schedule from device
function* handleQueryScheduleFromDevice(action: PayloadAction<number>) {
  try {
    yield call(api.queryScheduleFromDevice, action.payload);
    yield put(queryScheduleFromDeviceSuccess());
    // Wait a bit for device to respond and backend to save, then refresh
    yield call(delay, 2000);
    yield put(fetchSchedule(action.payload));
  } catch (error: unknown) {
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    yield put(
      queryScheduleFromDeviceFailure(err.response?.data?.error || err.message || "查詢設備排程失敗")
    );
  }
}

// Helper function for delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function* scheduleManagementSaga() {
  yield takeLatest(fetchSchedule.type, handleFetchSchedule);
  yield takeLatest(createSchedule.type, handleCreateSchedule);
  yield takeLatest(updateSchedule.type, handleUpdateSchedule);
  yield takeLatest(deleteSchedule.type, handleDeleteSchedule);
  yield takeLatest(syncSchedule.type, handleSyncSchedule);
  yield takeLatest(queryScheduleFromDevice.type, handleQueryScheduleFromDevice);
}

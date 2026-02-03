import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { Device } from "./types";
import {
  fetchDevices as fetchDevicesApi,
  createDevice as createDeviceApi,
  updateDevice as updateDeviceApi,
  deleteDevice as deleteDeviceApi,
} from "../../../api/device";

// Fetch all devices
function* fetchDevicesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(fetchDevicesApi);
    if (response.success && Array.isArray(response.data)) {
      yield put(actions.fetchDevicesSuccess(response.data as Device[]));
    } else {
      yield put(actions.fetchDevicesFailure("載入設備失敗"));
    }
  } catch (error: any) {
    console.error("Failed to fetch devices:", error);
    const message = error?.response?.status === 403
      ? "您沒有權限查看設備列表"
      : "載入設備失敗";
    yield put(actions.fetchDevicesFailure(message));
  }
}

// Create device
function* createDeviceSaga(action: ReturnType<typeof actions.createDevice>): Generator<any, void, any> {
  try {
    const response = yield call(createDeviceApi, action.payload);
    if (response.success && response.data) {
      yield put(actions.createDeviceSuccess(response.data as Device));
    } else {
      yield put(actions.createDeviceFailure(response.message || "創建設備失敗"));
    }
  } catch (error: any) {
    console.error("Failed to create device:", error);
    const message = error?.response?.data?.message || "創建設備失敗";
    yield put(actions.createDeviceFailure(message));
  }
}

// Update device
function* updateDeviceSaga(action: ReturnType<typeof actions.updateDevice>): Generator<any, void, any> {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateDeviceApi, id, data);
    if (response.success && response.data) {
      yield put(actions.updateDeviceSuccess(response.data as Device));
    } else {
      yield put(actions.updateDeviceFailure(response.message || "更新設備失敗"));
    }
  } catch (error: any) {
    console.error("Failed to update device:", error);
    const message = error?.response?.data?.message || "更新設備失敗";
    yield put(actions.updateDeviceFailure(message));
  }
}

// Delete device
function* deleteDeviceSaga(action: ReturnType<typeof actions.deleteDevice>): Generator<any, void, any> {
  try {
    const response = yield call(deleteDeviceApi, action.payload);
    if (response.success) {
      yield put(actions.deleteDeviceSuccess(action.payload));
    } else {
      yield put(actions.deleteDeviceFailure(response.message || "刪除設備失敗"));
    }
  } catch (error: any) {
    console.error("Failed to delete device:", error);
    const message = error?.response?.data?.message || "刪除設備失敗";
    yield put(actions.deleteDeviceFailure(message));
  }
}

// Root saga
export function* deviceManagementSaga() {
  yield takeLatest(actions.fetchDevices.type, fetchDevicesSaga);
  yield takeLatest(actions.createDevice.type, createDeviceSaga);
  yield takeLatest(actions.updateDevice.type, updateDeviceSaga);
  yield takeLatest(actions.deleteDevice.type, deleteDeviceSaga);
}

export default deviceManagementSaga;

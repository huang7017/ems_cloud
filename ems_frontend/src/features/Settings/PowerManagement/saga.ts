import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { Power, MenuItem } from "./types";
import {
  fetchPowers as fetchPowersApi,
  createPower as createPowerApi,
  updatePower as updatePowerApi,
  deletePower as deletePowerApi,
} from "../../../api/power";
import { fetchMenus as fetchMenusApi } from "../../../api/menu";

// Fetch all powers
function* fetchPowersSaga(): Generator<any, void, any> {
  try {
    const response = yield call(fetchPowersApi);
    if (response.success && Array.isArray(response.data)) {
      yield put(actions.fetchPowersSuccess(response.data as Power[]));
    } else {
      yield put(actions.fetchPowersFailure("載入權限失敗"));
    }
  } catch (error) {
    console.error("Failed to fetch powers:", error);
    yield put(actions.fetchPowersFailure("載入權限失敗"));
  }
}

// Fetch menus
function* fetchMenusSaga(): Generator<any, void, any> {
  try {
    const response = yield call(fetchMenusApi);
    if (response.success && Array.isArray(response.data)) {
      yield put(actions.fetchMenusSuccess(response.data as MenuItem[]));
    } else {
      yield put(actions.fetchMenusFailure("載入菜單失敗"));
    }
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    yield put(actions.fetchMenusFailure("載入菜單失敗"));
  }
}

// Create power
function* createPowerSaga(action: ReturnType<typeof actions.createPower>): Generator<any, void, any> {
  try {
    const response = yield call(createPowerApi, action.payload);
    if (response.success && response.data) {
      yield put(actions.createPowerSuccess(response.data as Power));
    } else {
      yield put(actions.createPowerFailure("創建權限失敗"));
    }
  } catch (error) {
    console.error("Failed to create power:", error);
    yield put(actions.createPowerFailure("創建權限失敗"));
  }
}

// Update power
function* updatePowerSaga(action: ReturnType<typeof actions.updatePower>): Generator<any, void, any> {
  try {
    const response = yield call(updatePowerApi, action.payload);
    if (response.success) {
      // Refetch to get updated data
      yield put(actions.fetchPowers());
      yield put(
        actions.updatePowerSuccess({
          id: action.payload.id!,
          menu_id: action.payload.menu_id,
          title: action.payload.title,
          code: action.payload.code,
          description: action.payload.description,
          sort: action.payload.sort,
          is_enable: action.payload.is_enable,
        })
      );
    } else {
      yield put(actions.updatePowerFailure("更新權限失敗"));
    }
  } catch (error) {
    console.error("Failed to update power:", error);
    yield put(actions.updatePowerFailure("更新權限失敗"));
  }
}

// Delete power
function* deletePowerSaga(action: ReturnType<typeof actions.deletePower>): Generator<any, void, any> {
  try {
    const response = yield call(deletePowerApi, action.payload);
    if (response.success) {
      yield put(actions.deletePowerSuccess(action.payload));
    } else {
      yield put(actions.deletePowerFailure("刪除權限失敗"));
    }
  } catch (error) {
    console.error("Failed to delete power:", error);
    yield put(actions.deletePowerFailure("刪除權限失敗"));
  }
}

// Root saga
export function* powerManagementSaga() {
  yield takeLatest(actions.fetchPowers.type, fetchPowersSaga);
  yield takeLatest(actions.fetchMenus.type, fetchMenusSaga);
  yield takeLatest(actions.createPower.type, createPowerSaga);
  yield takeLatest(actions.updatePower.type, updatePowerSaga);
  yield takeLatest(actions.deletePower.type, deletePowerSaga);
}

export default powerManagementSaga;

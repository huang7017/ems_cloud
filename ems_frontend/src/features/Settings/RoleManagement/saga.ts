import { call, put, takeLatest, all } from "redux-saga/effects";
import { actions } from "./reducer";
import type { Role, Power, MenuItem } from "./types";
import {
  fetchRoles as fetchRolesApi,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
  fetchRolePowers as fetchRolePowersApi,
  assignPowers as assignPowersApi,
} from "../../../api/role";
import { fetchPowers as fetchPowersApi } from "../../../api/power";
import { fetchMenus as fetchMenusApi } from "../../../api/menu";

// Fetch all roles
function* fetchRolesSaga(): Generator<any, void, any> {
  try {
    const response = yield call(fetchRolesApi);
    if (response.success && Array.isArray(response.data)) {
      yield put(actions.fetchRolesSuccess(response.data as Role[]));
    } else {
      yield put(actions.fetchRolesFailure("載入角色失敗"));
    }
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    yield put(actions.fetchRolesFailure("載入角色失敗"));
  }
}

// Create role
function* createRoleSaga(action: ReturnType<typeof actions.createRole>): Generator<any, void, any> {
  try {
    const response = yield call(createRoleApi, action.payload);
    if (response.success && response.data) {
      yield put(actions.createRoleSuccess(response.data as Role));
    } else {
      yield put(actions.createRoleFailure("創建角色失敗"));
    }
  } catch (error) {
    console.error("Failed to create role:", error);
    yield put(actions.createRoleFailure("創建角色失敗"));
  }
}

// Update role
function* updateRoleSaga(action: ReturnType<typeof actions.updateRole>): Generator<any, void, any> {
  try {
    const response = yield call(updateRoleApi, action.payload);
    if (response.success) {
      // Refetch to get updated data
      yield put(actions.fetchRoles());
      yield put(
        actions.updateRoleSuccess({
          id: action.payload.id!,
          title: action.payload.title,
          description: action.payload.description,
          sort: action.payload.sort,
          is_enable: action.payload.is_enable,
        })
      );
    } else {
      yield put(actions.updateRoleFailure("更新角色失敗"));
    }
  } catch (error) {
    console.error("Failed to update role:", error);
    yield put(actions.updateRoleFailure("更新角色失敗"));
  }
}

// Delete role
function* deleteRoleSaga(action: ReturnType<typeof actions.deleteRole>): Generator<any, void, any> {
  try {
    const response = yield call(deleteRoleApi, action.payload);
    if (response.success) {
      yield put(actions.deleteRoleSuccess(action.payload));
    } else {
      yield put(actions.deleteRoleFailure("刪除角色失敗"));
    }
  } catch (error) {
    console.error("Failed to delete role:", error);
    yield put(actions.deleteRoleFailure("刪除角色失敗"));
  }
}

// Fetch powers and menus for permissions dialog
function* fetchPowersAndMenusSaga(): Generator<any, void, any> {
  try {
    const [powersResponse, menusResponse] = yield all([
      call(fetchPowersApi),
      call(fetchMenusApi),
    ]);

    const powers: Power[] =
      powersResponse.success && Array.isArray(powersResponse.data)
        ? powersResponse.data
        : [];
    const menus: MenuItem[] =
      menusResponse.success && Array.isArray(menusResponse.data)
        ? menusResponse.data
        : [];

    yield put(actions.fetchPowersAndMenusSuccess({ powers, menus }));
  } catch (error) {
    console.error("Failed to fetch powers and menus:", error);
    yield put(actions.fetchPowersAndMenusFailure("載入權限資料失敗"));
  }
}

// Fetch role's current powers
function* fetchRolePowersSaga(action: ReturnType<typeof actions.fetchRolePowers>): Generator<any, void, any> {
  try {
    const response = yield call(fetchRolePowersApi, action.payload);
    if (response.success && Array.isArray(response.data)) {
      const powerIds = (response.data as Power[]).map((p) => p.id);
      yield put(actions.fetchRolePowersSuccess(powerIds));
    } else {
      yield put(actions.fetchRolePowersFailure("載入角色權限失敗"));
    }
  } catch (error) {
    console.error("Failed to fetch role powers:", error);
    yield put(actions.fetchRolePowersFailure("載入角色權限失敗"));
  }
}

// Assign powers to role
function* assignPowersSaga(action: ReturnType<typeof actions.assignPowers>): Generator<any, void, any> {
  try {
    const { roleId, powerIds } = action.payload;
    const response = yield call(assignPowersApi, roleId, { power_ids: powerIds });
    if (response.success) {
      yield put(actions.assignPowersSuccess());
    } else {
      yield put(actions.assignPowersFailure("保存權限失敗"));
    }
  } catch (error) {
    console.error("Failed to assign powers:", error);
    yield put(actions.assignPowersFailure("保存權限失敗"));
  }
}

// Root saga
export function* roleManagementSaga() {
  yield takeLatest(actions.fetchRoles.type, fetchRolesSaga);
  yield takeLatest(actions.createRole.type, createRoleSaga);
  yield takeLatest(actions.updateRole.type, updateRoleSaga);
  yield takeLatest(actions.deleteRole.type, deleteRoleSaga);
  yield takeLatest(actions.fetchPowersAndMenus.type, fetchPowersAndMenusSaga);
  yield takeLatest(actions.fetchRolePowers.type, fetchRolePowersSaga);
  yield takeLatest(actions.assignPowers.type, assignPowersSaga);
}

export default roleManagementSaga;

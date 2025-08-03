import { call, put, takeLatest, delay } from "redux-saga/effects";
import { actions } from "./reducer";
import type { User, Role, Permission } from "./types";

// Fake data for users
const fakeUsers: User[] = [
  {
    id: "1",
    name: "王大明",
    email: "daming.wang@example.com",
    role: "管理員",
    status: "enabled",
    lastLogin: "2023/05/20 13:45",
    avatar: "WD",
  },
  {
    id: "2",
    name: "林小華",
    email: "xiaohua.lin@example.com",
    role: "操作員",
    status: "enabled",
    lastLogin: "2023/05/21 09:15",
    avatar: "XL",
  },
  {
    id: "3",
    name: "張明輝",
    email: "minghui.zhang@example.com",
    role: "操作員",
    status: "enabled",
    lastLogin: "2023/05/19 16:30",
    avatar: "ZM",
  },
  {
    id: "4",
    name: "李芳華",
    email: "fanghua.li@example.com",
    role: "操作員",
    status: "disabled",
    lastLogin: "2023/05/10 11:20",
    avatar: "LF",
  },
];

// Fake data for roles and permissions
const fakeRoles: Role[] = [
  {
    id: "1",
    name: "管理員",
    permissions: [
      // Dashboard permissions
      {
        id: "dashboard_view_all",
        category: "儀表板",
        name: "查看所有數據",
        description: "View All Data",
        checked: true,
      },
      {
        id: "dashboard_export",
        category: "儀表板",
        name: "導出報表",
        description: "Export Reports",
        checked: true,
      },
      // Device management permissions
      {
        id: "device_view",
        category: "設備管理",
        name: "查看設備",
        description: "View Devices",
        checked: true,
      },
      {
        id: "device_add",
        category: "設備管理",
        name: "新增設備",
        description: "Add Devices",
        checked: true,
      },
      {
        id: "device_edit",
        category: "設備管理",
        name: "編輯設備",
        description: "Edit Devices",
        checked: true,
      },
      {
        id: "device_delete",
        category: "設備管理",
        name: "刪除設備",
        description: "Delete Devices",
        checked: true,
      },
      // User permissions
      {
        id: "user_view",
        category: "用戶權限",
        name: "查看用戶",
        description: "View Users",
        checked: true,
      },
      {
        id: "user_add",
        category: "用戶權限",
        name: "新增用戶",
        description: "Add Users",
        checked: true,
      },
      {
        id: "user_edit",
        category: "用戶權限",
        name: "編輯用戶",
        description: "Edit Users",
        checked: true,
      },
      {
        id: "user_delete",
        category: "用戶權限",
        name: "刪除用戶",
        description: "Delete Users",
        checked: true,
      },
    ],
  },
  {
    id: "2",
    name: "操作員",
    permissions: [
      // Dashboard permissions
      {
        id: "dashboard_view_all",
        category: "儀表板",
        name: "查看所有數據",
        description: "View All Data",
        checked: true,
      },
      {
        id: "dashboard_export",
        category: "儀表板",
        name: "導出報表",
        description: "Export Reports",
        checked: false,
      },
      // Device management permissions
      {
        id: "device_view",
        category: "設備管理",
        name: "查看設備",
        description: "View Devices",
        checked: true,
      },
      {
        id: "device_add",
        category: "設備管理",
        name: "新增設備",
        description: "Add Devices",
        checked: false,
      },
      {
        id: "device_edit",
        category: "設備管理",
        name: "編輯設備",
        description: "Edit Devices",
        checked: false,
      },
      {
        id: "device_delete",
        category: "設備管理",
        name: "刪除設備",
        description: "Delete Devices",
        checked: false,
      },
      // User permissions
      {
        id: "user_view",
        category: "用戶權限",
        name: "查看用戶",
        description: "View Users",
        checked: false,
      },
      {
        id: "user_add",
        category: "用戶權限",
        name: "新增用戶",
        description: "Add Users",
        checked: false,
      },
      {
        id: "user_edit",
        category: "用戶權限",
        name: "編輯用戶",
        description: "Edit Users",
        checked: false,
      },
      {
        id: "user_delete",
        category: "用戶權限",
        name: "刪除用戶",
        description: "Delete Users",
        checked: false,
      },
    ],
  },
];

// Simulate API delay
const simulateApiCall = () => delay(500);

// User sagas
function* fetchUsersSaga() {
  try {
    yield call(simulateApiCall);
    yield put(actions.fetchUsersSuccess(fakeUsers));
  } catch (error) {
    yield put(actions.fetchUsersFailure("Failed to fetch users"));
  }
}

function* createUserSaga(action: any) {
  try {
    yield call(simulateApiCall);
    const newUser: User = {
      ...action.payload,
      id: Date.now().toString(),
      lastLogin: new Date().toLocaleString("zh-TW"),
      avatar: action.payload.name.substring(0, 2).toUpperCase(),
    };
    yield put(actions.createUserSuccess(newUser));
  } catch (error) {
    console.error("Failed to create user", error);
    yield put(actions.createUserFailure("Failed to create user"));
  }
}

function* updateUserSaga(action: any) {
  try {
    yield call(simulateApiCall);
    yield put(actions.updateUserSuccess(action.payload));
  } catch (error) {
    console.error("Failed to update user", error);
    yield put(actions.updateUserFailure("Failed to update user"));
  }
}

function* deleteUserSaga(action: any) {
  try {
    yield call(simulateApiCall);
    yield put(actions.deleteUserSuccess(action.payload));
  } catch (error) {
    console.error("Failed to delete user", error);
    yield put(actions.deleteUserFailure("Failed to delete user"));
  }
}

// Role sagas
function* fetchRolesSaga() {
  try {
    yield call(simulateApiCall);
    yield put(actions.fetchRolesSuccess(fakeRoles));
  } catch (error) {
    console.error("Failed to fetch roles", error);
    yield put(actions.fetchRolesFailure("Failed to fetch roles"));
  }
}

function* createRoleSaga(action: any) {
  try {
    yield call(simulateApiCall);
    const newRole: Role = {
      ...action.payload,
      id: Date.now().toString(),
    };
    yield put(actions.createRoleSuccess(newRole));
  } catch (error) {
    console.error("Failed to create role", error);
    yield put(actions.createRoleFailure("Failed to create role"));
  }
}

function* updateRoleSaga(action: any) {
  try {
    yield call(simulateApiCall);
    yield put(actions.updateRoleSuccess(action.payload));
  } catch (error) {
    console.error("Failed to update role", error);
    yield put(actions.updateRoleFailure("Failed to update role"));
  }
}

function* deleteRoleSaga(action: any) {
  try {
    yield call(simulateApiCall);
    yield put(actions.deleteRoleSuccess(action.payload));
  } catch (error) {
    console.error("Failed to delete role", error);
    yield put(actions.deleteRoleFailure("Failed to delete role"));
  }
}

// Root saga
export function* userManagementSaga() {
  // User sagas
  yield takeLatest(actions.fetchUsers.type, fetchUsersSaga);
  yield takeLatest(actions.createUser.type, createUserSaga);
  yield takeLatest(actions.updateUser.type, updateUserSaga);
  yield takeLatest(actions.deleteUser.type, deleteUserSaga);

  // Role sagas
  yield takeLatest(actions.fetchRoles.type, fetchRolesSaga);
  yield takeLatest(actions.createRole.type, createRoleSaga);
  yield takeLatest(actions.updateRole.type, updateRoleSaga);
  yield takeLatest(actions.deleteRole.type, deleteRoleSaga);
}

export const rootSaga = userManagementSaga;

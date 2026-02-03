import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { User, Role } from "./types";
import {
  fetchMembersApi,
  updateMemberStatusApi,
  createMemberApi,
  updateMemberApi,
  type MemberCreateRequest,
  type MemberUpdateRequest
} from "../../../api/member";
import {
  fetchRoles,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
} from "../../../api/role";
import type { Member } from "../../../api/member";

// 轉換 API Member 到 User 類型
function convertMemberToUser(member: Member): User {
  const roleNames = member.roles.map((r) => r.name).join(", ");
  return {
    id: member.id.toString(),
    name: member.name,
    email: member.email,
    role: roleNames || "無角色",
    roles: member.roles, // Keep the actual roles array
    status: member.is_enable ? "enabled" : "disabled",
    lastLogin: "", // API 不提供此字段
    avatar: member.name.substring(0, 2).toUpperCase(),
  };
}

// User sagas
function* fetchUsersSaga() {
  try {
    const response: Awaited<ReturnType<typeof fetchMembersApi>> = yield call(
      fetchMembersApi
    );
    if (response.success && Array.isArray(response.data)) {
      const users = response.data.map(convertMemberToUser);
      yield put(actions.fetchUsersSuccess(users));
    } else {
      yield put(actions.fetchUsersFailure("Failed to fetch users"));
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
    yield put(actions.fetchUsersFailure("Failed to fetch users"));
  }
}

function* createUserSaga(action: ReturnType<typeof actions.createUser>) {
  try {
    const userData = action.payload as any;

    // Prepare create request
    const createRequest: MemberCreateRequest = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_enable: userData.status === "enabled",
      role_ids: userData.roleIds || [],
    };

    // Call create API
    const response: Awaited<ReturnType<typeof createMemberApi>> =
      yield call(createMemberApi, createRequest);

    if (!response.success) {
      yield put(actions.createUserFailure("Failed to create user"));
      return;
    }

    // Refetch users to get updated data
    yield put(actions.fetchUsers());
    yield put(actions.createUserSuccess(response.data as any));
  } catch (error) {
    console.error("Failed to create user:", error);
    yield put(actions.createUserFailure("Failed to create user"));
  }
}

function* updateUserSaga(action: ReturnType<typeof actions.updateUser>) {
  try {
    const userData = action.payload as any;
    const userId = parseInt(userData.id);

    // Prepare update request
    const updateRequest: MemberUpdateRequest = {
      name: userData.name,
      email: userData.email,
      is_enable: userData.status === "enabled",
      role_ids: userData.roleIds || [],
    };

    // Include password only if provided
    if (userData.password) {
      updateRequest.password = userData.password;
    }

    // Call update API
    const response: Awaited<ReturnType<typeof updateMemberApi>> =
      yield call(updateMemberApi, userId, updateRequest);

    if (!response.success) {
      yield put(actions.updateUserFailure("Failed to update user"));
      return;
    }

    // Refetch users to get updated data
    yield put(actions.fetchUsers());
    yield put(actions.updateUserSuccess(response.data as any));
  } catch (error) {
    console.error("Failed to update user:", error);
    yield put(actions.updateUserFailure("Failed to update user"));
  }
}

function* deleteUserSaga(action: ReturnType<typeof actions.deleteUser>) {
  try {
    // 目前後端不支持刪除用戶，所以暫時只做停用
    const userId = action.payload;
    const response: Awaited<ReturnType<typeof updateMemberStatusApi>> =
      yield call(updateMemberStatusApi, parseInt(userId), false);

    if (response.success) {
      yield put(actions.deleteUserSuccess(userId));
    } else {
      yield put(actions.deleteUserFailure("Failed to delete user"));
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    yield put(actions.deleteUserFailure("Failed to delete user"));
  }
}

// Role sagas
function* fetchRolesSaga(): any {
  try {
    const response: Awaited<ReturnType<typeof fetchRoles>> = yield call(
      fetchRoles
    );
    if (response.success && Array.isArray(response.data)) {
      // 轉換為前端需要的格式
      const roles: Role[] = response.data.map((role: any) => ({
        id: role.id,
        name: role.title,
        permissions: [], // 權限暫時為空，之後可以通過 GetRolePowers API 獲取
      }));
      yield put(actions.fetchRolesSuccess(roles));
    } else {
      yield put(actions.fetchRolesFailure("Failed to fetch roles"));
    }
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    yield put(actions.fetchRolesFailure("Failed to fetch roles"));
  }
}

function* createRoleSaga(action: ReturnType<typeof actions.createRole>): any {
  try {
    const roleData = action.payload;
    const response: Awaited<ReturnType<typeof createRoleApi>> = yield call(
      createRoleApi,
      {
        title: roleData.name,
        description: "",
        sort: 0,
        is_enable: true
      }
    );

    if (response.success && response.data) {
      const newRole: Role = {
        id: response.data.id,
        name: response.data.title,
        permissions: []
      };
      yield put(actions.createRoleSuccess(newRole));
    } else {
      yield put(actions.createRoleFailure("Failed to create role"));
    }
  } catch (error) {
    console.error("Failed to create role:", error);
    yield put(actions.createRoleFailure("Failed to create role"));
  }
}

function* updateRoleSaga(action: ReturnType<typeof actions.updateRole>): any {
  try {
    const role = action.payload;
    const response: Awaited<ReturnType<typeof updateRoleApi>> = yield call(
      updateRoleApi,
      {
        id: role.id,
        title: role.name,
        description: "",
        sort: 0,
        is_enable: true
      }
    );

    if (response.success) {
      yield put(actions.updateRoleSuccess(role));
    } else {
      yield put(actions.updateRoleFailure("Failed to update role"));
    }
  } catch (error) {
    console.error("Failed to update role:", error);
    yield put(actions.updateRoleFailure("Failed to update role"));
  }
}

function* deleteRoleSaga(action: ReturnType<typeof actions.deleteRole>): any {
  try {
    const roleId = action.payload;
    const response: Awaited<ReturnType<typeof deleteRoleApi>> = yield call(
      deleteRoleApi,
      roleId
    );

    if (response.success) {
      yield put(actions.deleteRoleSuccess(roleId));
    } else {
      yield put(actions.deleteRoleFailure("Failed to delete role"));
    }
  } catch (error) {
    console.error("Failed to delete role:", error);
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

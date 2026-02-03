import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchCompanies,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  createCompany,
  createCompanySuccess,
  createCompanyFailure,
  updateCompany,
  updateCompanySuccess,
  updateCompanyFailure,
  deleteCompany,
  deleteCompanySuccess,
  deleteCompanyFailure,
  fetchCompanyTree,
  fetchCompanyTreeSuccess,
  fetchCompanyTreeFailure,
  fetchCompanyMembers,
  fetchCompanyMembersSuccess,
  fetchCompanyMembersFailure,
  addCompanyMember,
  addCompanyMemberSuccess,
  addCompanyMemberFailure,
  removeCompanyMember,
  removeCompanyMemberSuccess,
  removeCompanyMemberFailure,
  createCompanyManager,
  createCompanyManagerSuccess,
  createCompanyManagerFailure,
  createCompanyUser,
  createCompanyUserSuccess,
  createCompanyUserFailure,
  fetchCompanyDevices,
  fetchCompanyDevicesSuccess,
  fetchCompanyDevicesFailure,
  assignDevice,
  assignDeviceSuccess,
  assignDeviceFailure,
  removeDevice,
  removeDeviceSuccess,
  removeDeviceFailure,
  fetchAvailableDevices,
  fetchAvailableDevicesSuccess,
  fetchAvailableDevicesFailure,
} from "./reducer";
import type {
  Company,
  CompanyMember,
  CompanyDevice,
  CompanyTreeNode,
  AvailableDevice,
} from "./types";
import {
  fetchCompanies as fetchCompaniesApi,
  createCompany as createCompanyApi,
  updateCompany as updateCompanyApi,
  deleteCompany as deleteCompanyApi,
  fetchCompanyTree as fetchCompanyTreeApi,
  createCompanyManager as createCompanyManagerApi,
  createCompanyUser as createCompanyUserApi,
  fetchCompanyMembers as fetchCompanyMembersApi,
  addCompanyMember as addCompanyMemberApi,
  removeCompanyMember as removeCompanyMemberApi,
  fetchCompanyDevices as fetchCompanyDevicesApi,
  assignCompanyDevice as assignCompanyDeviceApi,
  removeCompanyDevice as removeCompanyDeviceApi,
} from "../../../api/company";
import { fetchUnassignedDevices as fetchUnassignedDevicesApi } from "../../../api/device";

function* fetchCompaniesSaga(): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetchCompaniesApi)) as {
      success: boolean;
      data: Company[];
    };
    if (response.success && Array.isArray(response.data)) {
      yield put(fetchCompaniesSuccess(response.data));
    } else {
      yield put(fetchCompaniesFailure("載入公司列表失敗"));
    }
  } catch (error) {
    yield put(fetchCompaniesFailure("載入公司列表失敗"));
  }
}

function* createCompanySaga(
  action: ReturnType<typeof createCompany>
): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(createCompanyApi, action.payload)) as {
      success: boolean;
      data: Company;
    };
    if (response.success && response.data) {
      yield put(createCompanySuccess(response.data));
      yield put(fetchCompanies());
    } else {
      yield put(createCompanyFailure("創建公司失敗"));
    }
  } catch (error) {
    yield put(createCompanyFailure("創建公司失敗"));
  }
}

function* updateCompanySaga(
  action: ReturnType<typeof updateCompany>
): Generator<unknown, void, unknown> {
  try {
    const { id, data } = action.payload;
    const response = (yield call(updateCompanyApi, id, data)) as {
      success: boolean;
      data: Company;
    };
    if (response.success && response.data) {
      yield put(updateCompanySuccess(response.data));
      yield put(fetchCompanies());
    } else {
      yield put(updateCompanyFailure("更新公司失敗"));
    }
  } catch (error) {
    yield put(updateCompanyFailure("更新公司失敗"));
  }
}

function* deleteCompanySaga(
  action: ReturnType<typeof deleteCompany>
): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(deleteCompanyApi, action.payload)) as {
      success: boolean;
    };
    if (response.success) {
      yield put(deleteCompanySuccess(action.payload));
    } else {
      yield put(deleteCompanyFailure("刪除公司失敗"));
    }
  } catch (error) {
    yield put(deleteCompanyFailure("刪除公司失敗"));
  }
}

function* fetchCompanyTreeSaga(
  action: ReturnType<typeof fetchCompanyTree>
): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetchCompanyTreeApi, action.payload)) as {
      success: boolean;
      data: CompanyTreeNode;
    };
    if (response.success && response.data) {
      yield put(fetchCompanyTreeSuccess(response.data));
    } else {
      yield put(fetchCompanyTreeFailure("載入公司樹結構失敗"));
    }
  } catch (error) {
    yield put(fetchCompanyTreeFailure("載入公司樹結構失敗"));
  }
}

function* createCompanyManagerSaga(
  action: ReturnType<typeof createCompanyManager>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, data } = action.payload;
    const response = (yield call(createCompanyManagerApi, companyId, data)) as {
      success: boolean;
    };
    if (response.success) {
      yield put(createCompanyManagerSuccess());
      yield put(fetchCompanyMembers(companyId));
    } else {
      yield put(createCompanyManagerFailure("創建管理員失敗"));
    }
  } catch (error) {
    yield put(createCompanyManagerFailure("創建管理員失敗"));
  }
}

function* createCompanyUserSaga(
  action: ReturnType<typeof createCompanyUser>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, data } = action.payload;
    const response = (yield call(createCompanyUserApi, companyId, data)) as {
      success: boolean;
    };
    if (response.success) {
      yield put(createCompanyUserSuccess());
      yield put(fetchCompanyMembers(companyId));
    } else {
      yield put(createCompanyUserFailure("創建用戶失敗"));
    }
  } catch (error) {
    yield put(createCompanyUserFailure("創建用戶失敗"));
  }
}

function* fetchCompanyMembersSaga(
  action: ReturnType<typeof fetchCompanyMembers>
): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(
      fetchCompanyMembersApi,
      action.payload
    )) as {
      success: boolean;
      data: CompanyMember[];
    };
    if (response.success && Array.isArray(response.data)) {
      yield put(fetchCompanyMembersSuccess(response.data));
    } else {
      yield put(fetchCompanyMembersFailure("載入公司成員失敗"));
    }
  } catch (error) {
    yield put(fetchCompanyMembersFailure("載入公司成員失敗"));
  }
}

function* addCompanyMemberSaga(
  action: ReturnType<typeof addCompanyMember>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, memberId } = action.payload;
    const response = (yield call(addCompanyMemberApi, companyId, {
      member_id: memberId,
    })) as { success: boolean };
    if (response.success) {
      yield put(addCompanyMemberSuccess());
      yield put(fetchCompanyMembers(companyId));
    } else {
      yield put(addCompanyMemberFailure("添加成員失敗"));
    }
  } catch (error) {
    yield put(addCompanyMemberFailure("添加成員失敗"));
  }
}

function* removeCompanyMemberSaga(
  action: ReturnType<typeof removeCompanyMember>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, memberId } = action.payload;
    const response = (yield call(
      removeCompanyMemberApi,
      companyId,
      memberId
    )) as { success: boolean };
    if (response.success) {
      yield put(removeCompanyMemberSuccess(memberId));
    } else {
      yield put(removeCompanyMemberFailure("移除成員失敗"));
    }
  } catch (error) {
    yield put(removeCompanyMemberFailure("移除成員失敗"));
  }
}

function* fetchCompanyDevicesSaga(
  action: ReturnType<typeof fetchCompanyDevices>
): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(
      fetchCompanyDevicesApi,
      action.payload
    )) as {
      success: boolean;
      data: CompanyDevice[];
    };
    if (response.success && Array.isArray(response.data)) {
      yield put(fetchCompanyDevicesSuccess(response.data));
    } else {
      yield put(fetchCompanyDevicesFailure("載入公司設備失敗"));
    }
  } catch (error) {
    yield put(fetchCompanyDevicesFailure("載入公司設備失敗"));
  }
}

function* assignDeviceSaga(
  action: ReturnType<typeof assignDevice>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, deviceId, content } = action.payload;
    const response = (yield call(assignCompanyDeviceApi, companyId, {
      device_id: deviceId,
      content,
    })) as { success: boolean };
    if (response.success) {
      yield put(assignDeviceSuccess());
      yield put(fetchCompanyDevices(companyId));
    } else {
      yield put(assignDeviceFailure("分配設備失敗"));
    }
  } catch (error) {
    yield put(assignDeviceFailure("分配設備失敗"));
  }
}

function* removeDeviceSaga(
  action: ReturnType<typeof removeDevice>
): Generator<unknown, void, unknown> {
  try {
    const { companyId, deviceId } = action.payload;
    const response = (yield call(
      removeCompanyDeviceApi,
      companyId,
      deviceId
    )) as { success: boolean };
    if (response.success) {
      yield put(removeDeviceSuccess(deviceId));
    } else {
      yield put(removeDeviceFailure("移除設備失敗"));
    }
  } catch (error) {
    yield put(removeDeviceFailure("移除設備失敗"));
  }
}

function* fetchAvailableDevicesSaga(): Generator<unknown, void, unknown> {
  try {
    const response = (yield call(fetchUnassignedDevicesApi)) as {
      success: boolean;
      data: Array<{ id: number; sn: string }>;
    };
    if (response.success && Array.isArray(response.data)) {
      const availableDevices: AvailableDevice[] = response.data.map((d) => ({
        id: d.id,
        sn: d.sn,
      }));
      yield put(fetchAvailableDevicesSuccess(availableDevices));
    } else {
      yield put(fetchAvailableDevicesFailure("載入設備列表失敗"));
    }
  } catch (error) {
    yield put(fetchAvailableDevicesFailure("載入設備列表失敗"));
  }
}

export function* companyManagementSaga() {
  yield takeLatest(fetchCompanies.type, fetchCompaniesSaga);
  yield takeLatest(createCompany.type, createCompanySaga);
  yield takeLatest(updateCompany.type, updateCompanySaga);
  yield takeLatest(deleteCompany.type, deleteCompanySaga);
  yield takeLatest(fetchCompanyTree.type, fetchCompanyTreeSaga);
  yield takeLatest(createCompanyManager.type, createCompanyManagerSaga);
  yield takeLatest(createCompanyUser.type, createCompanyUserSaga);
  yield takeLatest(fetchCompanyMembers.type, fetchCompanyMembersSaga);
  yield takeLatest(addCompanyMember.type, addCompanyMemberSaga);
  yield takeLatest(removeCompanyMember.type, removeCompanyMemberSaga);
  yield takeLatest(fetchCompanyDevices.type, fetchCompanyDevicesSaga);
  yield takeLatest(assignDevice.type, assignDeviceSaga);
  yield takeLatest(removeDevice.type, removeDeviceSaga);
  yield takeLatest(fetchAvailableDevices.type, fetchAvailableDevicesSaga);
}

export default companyManagementSaga;

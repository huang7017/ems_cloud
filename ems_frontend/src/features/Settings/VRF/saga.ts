import { call, put, takeLatest, select } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { actions } from "./reducer";
import type { createVRFSystemRequest, createVRFSystemResponse, getVrfACResponse, getVRFSystemsResponse, updateVrfACRequest, createIoModuleRequest } from "./types";
import { createVrfAC, createVRFSystem, deleteVrfAC, deleteVRFSystem, getVrfAC, getVRFSystems, updateVrfAC } from "../../../api/setting/vrf";
import { vrfIdSelector } from "./selector";
import { createIoModule, getIoModules } from "../../../api/setting/io";

const createVRFSytemSaga = function* (action: PayloadAction<createVRFSystemRequest>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const res: createVRFSystemResponse = yield call(
      createVRFSystem,
      action.payload
    );
    
    // Handle successful response
    if (res && res.data) {
      yield put(actions.createVRFSystemSuccess(res.data));
      const res2: getVRFSystemsResponse = yield call(getVRFSystems);
      yield put(actions.setVRFSystems(res2.data));
    } else {
      yield put(actions.createVRFSystemFailure(res?.message || "Failed to create temperature sensor"));
    }
    
    yield put(actions.setLoading(false));
  } catch (error) {
    console.error(error);
    yield put(actions.createVRFSystemFailure((error as Error).message || "An error occurred"));
    yield put(actions.setLoading(false));
  }
}

const deleteVRFSytemSaga = function* (action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    yield call(deleteVRFSystem, action.payload);
    const res2: getVRFSystemsResponse = yield call(getVRFSystems);
    yield put(actions.setVRFSystems(res2.data));
  } catch (error) {
    console.error(error);
  } finally {
    yield put(actions.setLoading(false));
  }
}

const getVRFSytemSaga = function* (): Generator<any, void, any> {
  try {
    const res: getVRFSystemsResponse = yield call(getVRFSystems);
    yield put(actions.setVRFSystems(res.data));
  } catch (error) {
    console.error(error);
  }
};

const createVrfACSaga = function* (action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response = yield call(createVrfAC, action.payload);
    
    if (response && response.success) {
      yield put(actions.createVrfACSuccess(response.data));
      // Refresh VRF systems after successful AC creation
      const res2: getVRFSystemsResponse = yield call(getVRFSystems);
      yield put(actions.setVRFSystems(res2.data));
    } else {
      yield put(actions.createVrfACFailure(response?.message || "Failed to create AC"));
    }
  } catch (error: any) {
    console.error("Error creating VRF AC:", error);
    yield put(actions.createVrfACFailure(error?.message || "An error occurred while creating AC"));
  } finally {
    yield put(actions.setLoading(false));
  }
}

const getVrfACSaga = function* (action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response: getVrfACResponse = yield call(getVrfAC, action.payload);
    yield put(actions.setVrfId(action.payload));
    yield put(actions.setVrfAC(response.data));
  } catch (error: any) {
    console.error("Error getting VRF AC:", error);
  } finally {
    yield put(actions.setLoading(false));
  }
}


const updateVrfACSaga = function* (action: PayloadAction<updateVrfACRequest>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response = yield call(updateVrfAC, action.payload.id, {
      name: action.payload.name,
      location: action.payload.location, 
      number: action.payload.number,
      temperature_sensor_id: action.payload.temperature_sensor_id
    });
    
    if (response && response.success) {
      const vrfId = yield select(vrfIdSelector);
      const res2: getVrfACResponse = yield call(getVrfAC, vrfId);
      yield put(actions.setVrfAC(res2.data));
    } else {
      yield put(actions.editVrfACFailure(response?.message || "Failed to update AC"));
    }
  } catch (error: any) {
    console.error("Error updating VRF AC:", error);
    yield put(actions.editVrfACFailure(error?.message || "An error occurred while updating AC"));
  } finally {
    yield put(actions.setLoading(false));
  }
}

const deleteVrfACSaga = function* (action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response = yield call(deleteVrfAC, action.payload);
    
    if (response && response.success) {
      yield put(actions.deleteVrfACSuccess(action.payload));
      const vrfId = yield select(vrfIdSelector);
      const res2: getVrfACResponse = yield call(getVrfAC, vrfId);
      yield put(actions.setVrfAC(res2.data));
    } else {
      yield put(actions.deleteVrfACFailure(response?.message || "Failed to delete AC"));
    }
  } catch (error: any) {
    console.error("Error deleting VRF AC:", error);
    yield put(actions.deleteVrfACFailure(error?.message || "An error occurred while deleting AC"));
  } finally {
    yield put(actions.setLoading(false));
  }
}

const createIoModuleSaga = function* (action: PayloadAction<createIoModuleRequest>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response = yield call(createIoModule, action.payload);
    if (response && response.success) {
      yield put(actions.createIoModuleSuccess(response.data));
    } else {
      yield put(actions.createIoModuleFailure(response?.message || "Failed to create IO module"));
    }
  } catch (error: any) {
    console.error("Error creating IO module:", error);
  } finally {
    yield put(actions.setLoading(false));
  }
}

const getIoModuleSaga = function* (action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield put(actions.setLoading(true));
    const response = yield call(getIoModules, action.payload);
    yield put(actions.setIoModule(response.data));
  } catch (error: any) {
    console.error("Error getting IO module:", error);
  } finally {
    yield put(actions.setLoading(false));
  }
}

export const rootSaga = function* (): Generator<any, void, any> {
  yield takeLatest(actions.createVRFSystem, createVRFSytemSaga);
  yield takeLatest(actions.getVRFSystems, getVRFSytemSaga);
  yield takeLatest(actions.deleteVRFSystem, deleteVRFSytemSaga);
  yield takeLatest(actions.createVrfAC, createVrfACSaga);
  yield takeLatest(actions.getVrfAC, getVrfACSaga);
  yield takeLatest(actions.editVrfAC, updateVrfACSaga);
  yield takeLatest(actions.deleteVrfAC, deleteVrfACSaga);
  yield takeLatest(actions.createIoModule, createIoModuleSaga);
  yield takeLatest(actions.getIoModule, getIoModuleSaga);
};

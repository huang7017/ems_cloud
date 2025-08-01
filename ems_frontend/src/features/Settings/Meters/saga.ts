import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { actions } from "./reducer";
import type { createMeterRequest, createMeterResponse, getMetersResponse } from "./types";
import { createMeter, deleteMeter, getMeters } from "../../../api/setting/meters";

const createMeterSaga = function* (action: PayloadAction<createMeterRequest>) {
  try {
    yield put(actions.setLoading(true));
    const res: createMeterResponse = yield call(
      createMeter,
      action.payload
    );
    
    // Handle successful response
    if (res && res.data) {
      yield put(actions.createMeterSuccess(res.data as any));
      const res2: getMetersResponse = yield call(getMeters);
      yield put(actions.setMeters(res2.data));
    } else {
      yield put(actions.createMeterFailure(res?.message || "Failed to create meter"));
    }
    
    yield put(actions.setLoading(false));
  } catch (error) {
    console.error(error);
    yield put(actions.createMeterFailure((error as Error).message || "An error occurred"));
    yield put(actions.setLoading(false));
  }
}

const deleteMeterSaga = function* (action: PayloadAction<string>) {
  try {
    yield put(actions.setLoading(true));
    yield call(deleteMeter, action.payload);
    const res2: getMetersResponse = yield call(getMeters);
    yield put(actions.setMeters(res2.data));
  } catch (error) {
    console.error(error);
  } finally {
    yield put(actions.setLoading(false));
  }
}

const getMetersSaga = function* () {
  try {
    const res: getMetersResponse = yield call(getMeters);
    yield put(actions.setMeters(res.data));
  } catch (error) {
    console.error(error);
  }
};
export const rootSaga = function* () {
  yield takeLatest(actions.createMeter, createMeterSaga);
  yield takeLatest(actions.getMeters, getMetersSaga);
  yield takeLatest(actions.deleteMeter, deleteMeterSaga);
};

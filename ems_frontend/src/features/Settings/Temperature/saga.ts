import { call, put, takeLatest } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import { actions } from "./reducer";
import type { createTemperatureRequest, createTemperatureResponse, getTemperaturesResponse } from "./types";
import { createTemperature, deleteTemperature, getTemperatures } from "../../../api/setting/temperature";

const createTemperatureSaga = function* (action: PayloadAction<createTemperatureRequest>) {
  try {
    yield put(actions.setLoading(true));
    const res: createTemperatureResponse = yield call(
      createTemperature,
      action.payload
    );
    
    // Handle successful response
    if (res && res.data) {
      yield put(actions.createTemperatureSuccess(res.data as any));
      const res2: getTemperaturesResponse = yield call(getTemperatures);
      yield put(actions.setTemperatures(res2.data));
    } else {
      yield put(actions.createTemperatureFailure(res?.message || "Failed to create temperature sensor"));
    }
    
    yield put(actions.setLoading(false));
  } catch (error) {
    console.error(error);
    yield put(actions.createTemperatureFailure((error as Error).message || "An error occurred"));
    yield put(actions.setLoading(false));
  }
}

const deleteTemperatureSaga = function* (action: PayloadAction<string>) {
  try {
    yield put(actions.setLoading(true));
    yield call(deleteTemperature, action.payload);
    const res2: getTemperaturesResponse = yield call(getTemperatures);
    yield put(actions.setTemperatures(res2.data));
  } catch (error) {
    console.error(error);
  } finally {
    yield put(actions.setLoading(false));
  }
}

const getTemperaturesSaga = function* () {
  try {
    const res: getTemperaturesResponse = yield call(getTemperatures);
    yield put(actions.setTemperatures(res.data));
  } catch (error) {
    console.error(error);
  }
};
export const rootSaga = function* () {
  yield takeLatest(actions.createTemperature, createTemperatureSaga);
  yield takeLatest(actions.getTemperatures, getTemperaturesSaga);
  yield takeLatest(actions.deleteTemperature, deleteTemperatureSaga);
};

import { call, put, takeLatest, all } from "redux-saga/effects";
import { actions } from "./reducer";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DashboardQueryParams } from "./types";
import {
  fetchDashboardCompaniesApi,
  fetchDashboardCompanyAreasApi,
  fetchDashboardSummaryApi,
  fetchDashboardMetersApi,
  fetchDashboardTemperaturesApi,
  fetchDashboardAreasApi,
  type DashboardCompaniesResponse,
  type DashboardCompanyAreasResponse,
  type DashboardSummaryResponse,
  type DashboardMeterResponse,
  type DashboardTemperatureResponse,
  type DashboardAreaResponse,
} from "../../api/home/dashboard";

// ==================== Companies List Saga ====================
function* fetchCompaniesListSaga() {
  try {
    const response: DashboardCompaniesResponse = yield call(fetchDashboardCompaniesApi);
    
    if (response.success && response.data) {
      yield put(actions.fetchCompaniesListSuccess(response));
    } else {
      yield put(actions.fetchCompaniesListFailure(response.error || "Failed to fetch companies list"));
    }
  } catch (error) {
    yield put(actions.fetchCompaniesListFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Company Areas List Saga ====================
function* fetchCompanyAreasListSaga(action: PayloadAction<{ company_id: number }>) {
  try {
    const params = action.payload;
    const response: DashboardCompanyAreasResponse = yield call(fetchDashboardCompanyAreasApi, params);
    
    if (response.success && response.data) {
      yield put(actions.fetchCompanyAreasListSuccess(response));
    } else {
      yield put(actions.fetchCompanyAreasListFailure(response.error || "Failed to fetch company areas list"));
    }
  } catch (error) {
    yield put(actions.fetchCompanyAreasListFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Summary Saga ====================
function* fetchSummarySaga() {
  try {
    const response: DashboardSummaryResponse = yield call(fetchDashboardSummaryApi);
    
    if (response.success && response.data) {
      yield put(actions.fetchSummarySuccess(response));
    } else {
      yield put(actions.fetchSummaryFailure(response.error || "Failed to fetch summary"));
    }
  } catch (error) {
    yield put(actions.fetchSummaryFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Meters Saga ====================
function* fetchMetersSaga(action: PayloadAction<DashboardQueryParams | undefined>) {
  try {
    const params = action.payload;
    const response: DashboardMeterResponse = yield call(fetchDashboardMetersApi, params);
    
    if (response.success && response.data) {
      yield put(actions.fetchMetersSuccess(response));
    } else {
      yield put(actions.fetchMetersFailure(response.error || "Failed to fetch meters data"));
    }
  } catch (error) {
    yield put(actions.fetchMetersFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Temperatures Saga ====================
function* fetchTemperaturesSaga(action: PayloadAction<DashboardQueryParams | undefined>) {
  try {
    const params = action.payload;
    const response: DashboardTemperatureResponse = yield call(fetchDashboardTemperaturesApi, params);
    
    if (response.success && response.data) {
      yield put(actions.fetchTemperaturesSuccess(response));
    } else {
      yield put(actions.fetchTemperaturesFailure(response.error || "Failed to fetch temperatures data"));
    }
  } catch (error) {
    yield put(actions.fetchTemperaturesFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Areas Saga ====================
function* fetchAreasSaga(action: PayloadAction<{ company_id: number }>) {
  try {
    const params = action.payload;
    const response: DashboardAreaResponse = yield call(fetchDashboardAreasApi, params);
    
    if (response.success && response.data) {
      yield put(actions.fetchAreasSuccess(response));
    } else {
      yield put(actions.fetchAreasFailure(response.error || "Failed to fetch areas data"));
    }
  } catch (error) {
    yield put(actions.fetchAreasFailure(error instanceof Error ? error.message : "Unknown error"));
  }
}

// ==================== Combined Fetch All Saga ====================
function* fetchAllDashboardDataSaga(action: PayloadAction<DashboardQueryParams | undefined>) {
  try {
    const params = action.payload;

    // Fetch summary, meters, and temperatures in parallel
    yield all([
      call(fetchSummarySaga),
      call(fetchMetersSaga, { ...action, payload: params }),
      call(fetchTemperaturesSaga, { ...action, payload: params }),
    ]);

    yield put(actions.fetchAllDashboardDataSuccess());
  } catch (error) {
    yield put(
      actions.fetchAllDashboardDataFailure(
        error instanceof Error ? error.message : "Failed to fetch dashboard data"
      )
    );
  }
}

// ==================== Root Saga ====================
export const rootSaga = function* () {
  yield takeLatest(actions.fetchCompaniesList.type, fetchCompaniesListSaga);
  yield takeLatest(actions.fetchCompanyAreasList.type, fetchCompanyAreasListSaga);
  yield takeLatest(actions.fetchSummary.type, fetchSummarySaga);
  yield takeLatest(actions.fetchMeters.type, fetchMetersSaga);
  yield takeLatest(actions.fetchTemperatures.type, fetchTemperaturesSaga);
  yield takeLatest(actions.fetchAreas.type, fetchAreasSaga);
  yield takeLatest(actions.fetchAllDashboardData.type, fetchAllDashboardDataSaga);
};

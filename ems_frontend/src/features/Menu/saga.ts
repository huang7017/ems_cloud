import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchMenusStart,
  fetchMenusSuccess,
  fetchMenusFailure,
} from "./reducer";
import { fetchSideBarApi } from "../../api/menu";
import type { MenuItem } from "../../api/menu";

function* fetchMenusSaga() {
  try {
    const response: { success: boolean; data: MenuItem[] } = yield call(
      fetchSideBarApi
    );
    if (response.success) {
      yield put(fetchMenusSuccess(response.data));
    } else {
      yield put(fetchMenusFailure("Failed to fetch menus"));
    }
  } catch (error) {
    yield put(
      fetchMenusFailure(
        error instanceof Error ? error.message : "An error occurred"
      )
    );
  }
}

export function* menuSaga() {
  yield takeLatest(fetchMenusStart.type, fetchMenusSaga);
}

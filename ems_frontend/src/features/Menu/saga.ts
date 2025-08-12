import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchMenusStart,
  fetchMenusSuccess,
  fetchMenusFailure,
} from "./reducer";
import { fetchMenusApi } from "../../api/menu";
import type { MenuItem } from "../../api/menu";

function* fetchMenusSaga() {
  try {
    console.log("Menu Saga: Starting to fetch menus...");
    // 移除這行，因為它會觸發無限循環
    // yield put(fetchMenusStart());
    console.log("Menu Saga: Calling API to fetch menus...");

    const response: { success: boolean; data: MenuItem[] } = yield call(
      fetchMenusApi
    );
    console.log("Menu Saga: API response received:", response);

    if (response.success) {
      console.log(
        "Menu Saga: Menu fetch successful, dispatching success action"
      );
      yield put(fetchMenusSuccess(response.data));
    } else {
      console.log("Menu Saga: Menu fetch failed, dispatching failure action");
      yield put(fetchMenusFailure("Failed to fetch menus"));
    }
  } catch (error) {
    console.error("Menu Saga: Error occurred:", error);
    yield put(
      fetchMenusFailure(
        error instanceof Error ? error.message : "An error occurred"
      )
    );
  }
}

export function* menuSaga() {
  console.log("Menu Saga: Setting up takeLatest for fetchMenusStart");
  yield takeLatest(fetchMenusStart.type, fetchMenusSaga);
}

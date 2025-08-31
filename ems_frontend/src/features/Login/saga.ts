import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { authLoginRequest, authLoginResponse } from "./types";
import type { PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { fetchAuthLoginData } from "../../api/auth";
import { fetchMenusStart } from "../Menu/index";

const LoginSaga = function* (action: PayloadAction<authLoginRequest>) {
  try {
    yield put(actions.setLoading(true));
    yield put(actions.setError(null));

    const response: authLoginResponse = yield call(
      fetchAuthLoginData,
      action.payload
    );

    if (response && response.success && response.data) {
      // Store tokens and user info in cookies
      Cookies.set("accessToken", response.data.access_token);
      Cookies.set("refreshToken", response.data.refresh_token);
      Cookies.set("name", encodeURIComponent(response.data.member.name));
      Cookies.set("userId", response.data.member.id);
      yield put(actions.setUser(response.data));

      // Fetch menus after successful login
      // Add a small delay to ensure tokens are stored in cookies
      yield new Promise((resolve) => setTimeout(resolve, 100));
      yield put(fetchMenusStart());
    } else {
      // Handle login failure
      const errorMessage = response?.error || "Login failed";
      yield put(actions.setError(errorMessage));
    }
  } catch (error) {
    yield put(actions.setError("Network error. Please try again."));
  } finally {
    yield put(actions.setLoading(false));
  }
};

export const rootSaga = function* () {
  yield takeLatest(actions.fetchAuthLogin, LoginSaga);
};

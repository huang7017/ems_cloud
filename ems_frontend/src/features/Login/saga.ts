import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { authLoginRequest, authLoginResponse } from "./types";
import type { PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { fetchAuthLoginData } from "../../api/auth";

const LoginSaga = function* (action: PayloadAction<authLoginRequest>) {
  try {
    yield put(actions.setLoading(true));
    yield put(actions.setError(null));

    console.log("Saga: Starting login process...");

    const data: authLoginResponse = yield call(
      fetchAuthLoginData,
      action.payload
    );

    console.log("Saga: Received response:", data);
    console.log("Saga: Response type:", typeof data);
    console.log("Saga: Response keys:", Object.keys(data || {}));

    if (data && data.success && data.data) {
      console.log("Saga: Login successful, storing tokens...");

      // Store tokens and user info in cookies
      Cookies.set("accessToken", data.data.access_token);
      Cookies.set("refreshToken", data.data.refresh_token);
      Cookies.set("name", encodeURIComponent(data.data.member.name));
      Cookies.set("userId", data.data.member.id);

      console.log("Saga: Tokens stored, redirecting to user management...");

      yield (window.location.href = "/");
    } else {
      // Handle login failure
      console.error("Saga: Login failed:", data);
      const errorMessage = data?.error || "Login failed";
      yield put(actions.setError(errorMessage));
    }
  } catch (error) {
    console.error("Saga: Login error:", error);
    yield put(actions.setError("Network error. Please try again."));
  } finally {
    yield put(actions.setLoading(false));
  }
};

export const rootSaga = function* () {
  yield takeLatest(actions.fetchAuthLogin, LoginSaga);
};

import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { authLoginRequest, authLoginResponse } from "./types";
import type { PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { fetchAuthLoginData } from "../../../api/auth";


const LoginSaga = function* (action: PayloadAction<authLoginRequest>) {
  try {
    yield put(actions.setLoading(true));
    const data: authLoginResponse = yield call(
      fetchAuthLoginData,
      action.payload
    );

    if (data.success) {
      Cookies.set("accessToken", data.jwt);
      Cookies.set("name", encodeURIComponent(data.name));
      yield (window.location.href = "/");
    }
  } catch (error) {
    console.error(error);
  }
};

export const rootSaga = function* () {
  yield takeLatest(actions.fetchAuthLogin, LoginSaga);
};

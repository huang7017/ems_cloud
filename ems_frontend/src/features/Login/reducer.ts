import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { authLoginRequest } from "./types";
import Cookies from "js-cookie";

export const initialState = {
  loading: false as boolean,
  login: {} as authLoginRequest,
  error: null as string | null,
  user: null as any,
  isAuthenticated: false as boolean,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    fetchAuthLogin(state, action: PayloadAction<authLoginRequest>) {
      state.loading = true;
      state.error = null;
      state.login = action.payload;
    },
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null; // Clear error on successful login
    },
    logout(state) {
      console.log(
        "Reducer: Logout action dispatched, clearing state and cookies"
      );

      // Clear cookies when logout is dispatched
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("name");
      Cookies.remove("userId");
      Cookies.remove("roleId");

      console.log("Reducer: Cookies cleared");

      // Clear state
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.login = {} as authLoginRequest;

      console.log("Reducer: State cleared");
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { actions, reducer } = authSlice;

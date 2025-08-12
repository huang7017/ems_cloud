import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { authLoginRequest } from "./types";

export const initialState = {
  loading: false as boolean,
  login: {} as authLoginRequest,
  error: null as string | null,
  user: null as any,
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
    fetchAuthLogin(_state, _action: PayloadAction<authLoginRequest>) {},
    setUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
  },
});

export const { actions, reducer } = authSlice;

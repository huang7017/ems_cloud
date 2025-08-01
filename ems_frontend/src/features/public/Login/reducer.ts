import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { authLoginRequest } from "./types";
export const initialState = {
  loading: false as boolean,
  login: {} as authLoginRequest,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    fetchAuthLogin(_state, _action: PayloadAction<authLoginRequest>) {},
  },
});

export const { actions, reducer } = authSlice;

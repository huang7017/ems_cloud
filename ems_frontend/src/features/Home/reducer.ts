import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const initialState = {
  loading: false as boolean,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { actions, reducer } = homeSlice;

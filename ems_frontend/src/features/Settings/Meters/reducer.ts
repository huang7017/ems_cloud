import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { meter, createMeterRequest } from "./types";
export const initialState = {
  loading: false as boolean,
  meters: [] as meter[],
  error: null as string | null
};

const meterSlice = createSlice({
  name: "meter",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    createMeter(_state, _action: PayloadAction<createMeterRequest>) {
      // This is just for triggering the saga
    },
    createMeterSuccess(state, _action: PayloadAction<meter>) {
      state.error = null;
    },
    createMeterFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    getMeters(_state) {
      // This is just for triggering the saga
    },
    setMeters(state, action: PayloadAction<meter[]>) {
      state.meters = action.payload;
    },
    deleteMeter(_state, _action: PayloadAction<string>) {
      // This is just for triggering the saga
    },
  },
});

export const { actions, reducer } = meterSlice;

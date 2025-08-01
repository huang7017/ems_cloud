import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { temperature, createTemperatureRequest } from "./types";
export const initialState = {
  loading: false as boolean,
  temperatures: [] as temperature[],
  error: null as string | null
};

const temperatureSlice = createSlice({
  name: "temperature",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    createTemperature(_state, _action: PayloadAction<createTemperatureRequest>) {},
    createTemperatureSuccess(_state, _action: PayloadAction<temperature>) {},
    createTemperatureFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    getTemperatures(_state) {},
    setTemperatures(state, action: PayloadAction<temperature[]>) {
      state.temperatures = action.payload;
    },
    deleteTemperature(_state, _action: PayloadAction<string>) {},
  },
});

export const { actions, reducer } = temperatureSlice;

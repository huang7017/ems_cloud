import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const initialState = {
  name: "" as string,
  image: "" as string,
};

const utilSlice = createSlice({
  name: "util",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setImage(state, action: PayloadAction<string>) {
      state.image = action.payload;
    }
  },
});

export const { actions, reducer } = utilSlice;

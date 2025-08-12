import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { MenuItem } from "../../api/menu";
import type { MenuState } from "./types";

const initialState: MenuState = {
  menus: [],
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    fetchMenusStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMenusSuccess: (state, action: PayloadAction<MenuItem[]>) => {
      state.loading = false;
      state.menus = action.payload;
      state.error = null;
    },
    fetchMenusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearMenus: (state) => {
      state.menus = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchMenusStart,
  fetchMenusSuccess,
  fetchMenusFailure,
  clearMenus,
} = menuSlice.actions;

export default menuSlice.reducer;

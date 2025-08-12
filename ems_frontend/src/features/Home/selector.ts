import { createSelector } from "@reduxjs/toolkit";
import { initialState } from "./reducer";
import type { IState } from "../../store/reducers";

const homeState = (state: IState) => state.home || initialState;

export const loadingSelector = createSelector(
  homeState,
  (state) => state.loading
);

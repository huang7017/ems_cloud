import { createSelector } from "@reduxjs/toolkit";
import type { IState } from "../../store/reducers";

export const utilState = (state: IState) => state.util;

export const memberNameSelector = createSelector(
  utilState,
  (state) => state.name
);

export const memberImageSelector = createSelector(
  utilState,
  (state) => state.image
);

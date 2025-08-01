import { createSelector } from "reselect";
import type { IState } from "@/store/reducers";

export const utilState = (state: IState) => state.util;

export const memberNameSelctor = createSelector(
  utilState,
  (state) => state.name
);

export const memberImageSelctor = createSelector(
  utilState,
  (state) => state.image
);

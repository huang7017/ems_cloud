import { createSelector } from "reselect";
import type { IState } from "../../../store/reducers";

export const meterState = (state: IState) => state.meter;

export const loadingSelector = createSelector(
  meterState,
  (state) => state.loading
);

export const metersSelector = createSelector(
  meterState,
  (state) => state.meters
);

export const errorSelector = createSelector(
  meterState,
  (state) => state.error
);

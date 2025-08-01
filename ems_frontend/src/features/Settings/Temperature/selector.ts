import { createSelector } from "reselect";
import type { IState } from "../../../store/reducers";

export const temperatureState = (state: IState) => state.temperature;

export const loadingSelector = createSelector(
  temperatureState,
  (state) => state.loading
);

export const temperaturesSelector = createSelector(
  temperatureState,
  (state) => state.temperatures
);

export const errorSelector = createSelector(
  temperatureState,
  (state) => state.error
);

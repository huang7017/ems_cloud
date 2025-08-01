import { createSelector } from "reselect";
import type { IState } from "../../../store/reducers";

export const vrfState = (state: IState) => state.vrf;

export const loadingSelector = createSelector(
  vrfState,
  (state) => state.loading
);

export const vrfSystemsSelector = createSelector(
  vrfState,
  (state) => state.vrfSystems
);

export const errorSelector = createSelector(
  vrfState,
  (state) => state.error
);

export const vrfACSelector = createSelector(
  vrfState,
  (state) => state.vrfAC
);

export const vrfIdSelector = createSelector(
  vrfState,
  (state) => state.vrfId
);

export const ioModuleSelector = createSelector(
  vrfState,
  (state) => state.ioModule
);
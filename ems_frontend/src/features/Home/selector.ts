import { createSelector } from "@reduxjs/toolkit";
import { initialState } from "./reducer";

const selectFeature = (state: any) => state.home || initialState;

export const loadingSelector = createSelector(selectFeature, (state) => state.loading);
export const dataInitializedSelector = createSelector(selectFeature, (state) => state.dataInitialized);
export const vrfSystemsSelector = createSelector(selectFeature, (state) => state.vrfSystems);
export const vrfSensorsSelector = createSelector(selectFeature, (state) => state.vrfSensors);

// 比對相關的 selectors
export const compareLoadingSelector = createSelector(selectFeature, (state) => state.compareLoading);
export const compareResultSelector = createSelector(selectFeature, (state) => state.compareResult);
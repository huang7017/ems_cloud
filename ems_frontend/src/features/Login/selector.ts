import type { IState } from "../../store/reducers";
import { createSelector } from "@reduxjs/toolkit";
import { initialState } from "./reducer";

const authState = (state: IState) => state.auth || initialState;

export const loadingSelector = createSelector(
  authState,
  (state) => state.loading
);

export const errorSelector = createSelector(authState, (state) => state.error);

export const userSelector = createSelector(authState, (state) => state.user);

export const isAuthenticatedSelector = createSelector(
  authState,
  (state) => state.isAuthenticated
);

export const loginDataSelector = createSelector(
  authState,
  (state) => state.login
);

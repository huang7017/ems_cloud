import type { IState } from "../../store/reducers";

export const selectUser = (state: IState) => state.auth.user;
export const selectIsLoading = (state: IState) => state.auth.loading;
export const selectError = (state: IState) => state.auth.error;
// Computed selector for authentication status
export const selectIsAuthenticated = (state: IState) => !!state.auth.user;
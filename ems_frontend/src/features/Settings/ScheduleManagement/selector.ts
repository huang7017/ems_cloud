import type { IState } from "../../../store/reducers";

export const selectSchedule = (state: IState) => state.scheduleManagement.schedule;
export const selectLoading = (state: IState) => state.scheduleManagement.loading;
export const selectSaving = (state: IState) => state.scheduleManagement.saving;
export const selectSyncing = (state: IState) => state.scheduleManagement.syncing;
export const selectError = (state: IState) => state.scheduleManagement.error;
export const selectSnackbar = (state: IState) => state.scheduleManagement.snackbar;

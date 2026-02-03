import type { IState } from "../../../store/reducers";
import type { Device } from "./types";

// Basic selectors
export const selectDevices = (state: IState): Device[] => state.deviceManagement.devices;
export const selectLoading = (state: IState): boolean => state.deviceManagement.loading;
export const selectError = (state: IState): string | null => state.deviceManagement.error;
export const selectSnackbar = (state: IState) => state.deviceManagement.snackbar;

// Derived selectors
export const selectDeviceCount = (state: IState): number => state.deviceManagement.devices.length;

export const selectDeviceBySN = (state: IState, sn: string): Device | undefined =>
  state.deviceManagement.devices.find((d) => d.sn === sn);

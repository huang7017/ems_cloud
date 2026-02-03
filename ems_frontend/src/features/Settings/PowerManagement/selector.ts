import type { IState } from "../../../store/reducers";
import type { Power, MenuItem } from "./types";

// Basic selectors
export const selectPowers = (state: IState): Power[] => state.powerManagement.powers;
export const selectMenus = (state: IState): MenuItem[] => state.powerManagement.menus;

// Loading states
export const selectLoading = (state: IState): boolean => state.powerManagement.loading;

// Error and snackbar
export const selectError = (state: IState): string | null => state.powerManagement.error;
export const selectSnackbar = (state: IState) => state.powerManagement.snackbar;

// Derived selectors
export const selectMenuNameById = (state: IState, menuId: number): string => {
  const menu = state.powerManagement.menus.find((m) => m.id === menuId);
  return menu?.title || `Menu ${menuId}`;
};

export const selectPowersByMenuId = (state: IState, menuId: number): Power[] => {
  return state.powerManagement.powers.filter((power) => power.menu_id === menuId);
};

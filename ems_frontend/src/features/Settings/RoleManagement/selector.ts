import type { IState } from "../../../store/reducers";
import type { Role, Power, MenuItem, GroupedPowers } from "./types";

// Basic selectors
export const selectRoles = (state: IState): Role[] => state.roleManagement.roles;
export const selectAllPowers = (state: IState): Power[] => state.roleManagement.allPowers;
export const selectMenus = (state: IState): MenuItem[] => state.roleManagement.menus;
export const selectSelectedRole = (state: IState): Role | null =>
  state.roleManagement.selectedRole;
export const selectSelectedPowerIds = (state: IState): number[] =>
  state.roleManagement.selectedPowerIds;

// Loading states
export const selectLoading = (state: IState): boolean => state.roleManagement.loading;
export const selectLoadingPermissions = (state: IState): boolean =>
  state.roleManagement.loadingPermissions;
export const selectSavingPermissions = (state: IState): boolean =>
  state.roleManagement.savingPermissions;

// Error and snackbar
export const selectError = (state: IState): string | null => state.roleManagement.error;
export const selectSnackbar = (state: IState) => state.roleManagement.snackbar;

// Derived selectors
export const selectMenuNameById = (state: IState, menuId: number): string => {
  const menu = state.roleManagement.menus.find((m) => m.id === menuId);
  return menu?.title || `菜單 ${menuId}`;
};

export const selectGroupedPowers = (state: IState): GroupedPowers => {
  const powers = state.roleManagement.allPowers;
  const menus = state.roleManagement.menus;

  const grouped: GroupedPowers = {};

  powers.forEach((power) => {
    const menu = menus.find((m) => m.id === power.menu_id);
    const menuName = menu?.title || `菜單 ${power.menu_id}`;
    if (!grouped[menuName]) {
      grouped[menuName] = [];
    }
    grouped[menuName].push(power);
  });

  return grouped;
};

export const selectSelectedPowerCount = (state: IState): number =>
  state.roleManagement.selectedPowerIds.length;

export const selectIsPowerSelected = (state: IState, powerId: number): boolean =>
  state.roleManagement.selectedPowerIds.includes(powerId);

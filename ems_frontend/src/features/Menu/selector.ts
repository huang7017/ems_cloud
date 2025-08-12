import type { IState } from "../../store/reducers";

export const selectMenuState = (state: IState) => state.menu;
export const selectMenus = (state: IState) => state.menu.menus;
export const selectMenuLoading = (state: IState) => state.menu.loading;
export const selectMenuError = (state: IState) => state.menu.error;

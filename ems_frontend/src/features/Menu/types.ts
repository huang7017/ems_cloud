import type { MenuItem } from "../../api/menu";

export interface MenuState {
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
}

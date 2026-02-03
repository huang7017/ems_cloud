// Role types
export interface Role {
  id: number;
  title: string;
  description: string;
  sort: number;
  is_enable: boolean;
}

export interface RoleRequest {
  id?: number;
  title: string;
  description: string;
  sort: number;
  is_enable: boolean;
}

// Power types (for role permissions)
export interface Power {
  id: number;
  menu_id: number;
  title: string;
  code: string;
  description: string;
  sort: number;
  is_enable: boolean;
}

export interface MenuItem {
  id: number;
  title: string;
  url?: string;
  icon?: string;
  parent_id?: number;
  sort?: number;
  is_enable?: boolean;
}

export interface GroupedPowers {
  [menuName: string]: Power[];
}

export interface AssignPowersRequest {
  power_ids: number[];
}

// State
export interface RoleManagementState {
  roles: Role[];
  allPowers: Power[];
  menus: MenuItem[];
  selectedRole: Role | null;
  selectedPowerIds: number[];
  loading: boolean;
  loadingPermissions: boolean;
  savingPermissions: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  };
}

// Dialog state
export interface RoleDialogState {
  open: boolean;
  editingRole: Role | null;
  formData: RoleRequest;
}

export interface PermissionsDialogState {
  open: boolean;
  selectedRole: Role | null;
  selectedPowerIds: number[];
}

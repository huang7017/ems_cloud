// Power types
export interface Power {
  id: number;
  menu_id: number;
  title: string;
  code: string;
  description: string;
  sort: number;
  is_enable: boolean;
}

export interface PowerRequest {
  id?: number;
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

// State
export interface PowerManagementState {
  powers: Power[];
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  };
}

// Dialog state
export interface PowerDialogState {
  open: boolean;
  editingPower: Power | null;
  formData: PowerRequest;
}

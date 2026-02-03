// Device types
export interface Device {
  id: number;
  sn: string;
  create_id: number;
  create_time: string;
  modify_id: number;
  modify_time: string;
}

export interface DeviceRequest {
  id?: number;
  sn: string;
}

// State
export interface DeviceManagementState {
  devices: Device[];
  loading: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  };
}

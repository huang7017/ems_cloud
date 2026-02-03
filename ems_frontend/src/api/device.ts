import axios from "../helper/axios";

// Types
export interface Device {
  id: number;
  sn: string;
  create_id: number;
  create_time: string;
  modify_id: number;
  modify_time: string;
}

export interface DeviceCreateRequest {
  sn: string;
}

export interface DeviceUpdateRequest {
  sn: string;
}

// API functions
export const fetchDevices = async () => {
  try {
    const response = await axios.get("/devices");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDeviceById = async (id: number) => {
  try {
    const response = await axios.get(`/devices/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createDevice = async (payload: DeviceCreateRequest) => {
  try {
    const response = await axios.post("/devices", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDevice = async (id: number, payload: DeviceUpdateRequest) => {
  try {
    const response = await axios.put(`/devices/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteDevice = async (id: number) => {
  try {
    const response = await axios.delete(`/devices/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 獲取未被綁定到任何公司的設備
export const fetchUnassignedDevices = async () => {
  try {
    const response = await axios.get("/devices/unassigned");
    return response.data;
  } catch (error) {
    throw error;
  }
};

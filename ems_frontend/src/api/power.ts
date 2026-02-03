import axios from "../helper/axios";

// Types
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

export interface PowersByRoleResponse {
  role_id: number;
  powers: Power[];
}

// API functions
export const fetchPowers = async () => {
  try {
    const response = await axios.get("/powers");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPowerById = async (id: number) => {
  try {
    const response = await axios.get(`/powers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPowersByMenuId = async (menuId: number) => {
  try {
    const response = await axios.get(`/powers/menu?menu_id=${menuId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPowersByRoleId = async (roleId: number) => {
  try {
    const response = await axios.get(`/powers/role?role_id=${roleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPower = async (payload: PowerRequest) => {
  try {
    const response = await axios.post("/powers", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePower = async (payload: PowerRequest) => {
  try {
    const response = await axios.put(`/powers/${payload.id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePower = async (id: number) => {
  try {
    const response = await axios.delete(`/powers/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

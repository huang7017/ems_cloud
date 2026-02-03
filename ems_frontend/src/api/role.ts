import axios from "../helper/axios";

// Types
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

export interface AssignPowersRequest {
  power_ids: number[];
}

export interface AssignMembersRequest {
  member_ids: number[];
}

export interface RolePowersResponse {
  role_id: number;
  power_ids: number[];
}

export interface RoleMembersResponse {
  role_id: number;
  member_ids: number[];
}

// API functions
export const fetchRoles = async () => {
  try {
    const response = await axios.get("/roles");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRoleById = async (id: number) => {
  try {
    const response = await axios.get(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createRole = async (payload: RoleRequest) => {
  try {
    const response = await axios.post("/roles", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRole = async (payload: RoleRequest) => {
  try {
    const response = await axios.put(`/roles/${payload.id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRole = async (id: number) => {
  try {
    const response = await axios.delete(`/roles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Role Powers
export const fetchRolePowers = async (roleId: number) => {
  try {
    const response = await axios.get(`/roles/${roleId}/powers`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignPowers = async (roleId: number, payload: AssignPowersRequest) => {
  try {
    const response = await axios.post(`/roles/${roleId}/powers`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removePowers = async (roleId: number, payload: AssignPowersRequest) => {
  try {
    const response = await axios.delete(`/roles/${roleId}/powers`, { data: payload });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Role Members
export const fetchRoleMembers = async (roleId: number) => {
  try {
    const response = await axios.get(`/roles/${roleId}/members`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignMembers = async (roleId: number, payload: AssignMembersRequest) => {
  try {
    const response = await axios.post(`/roles/${roleId}/members`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeMembers = async (roleId: number, payload: AssignMembersRequest) => {
  try {
    const response = await axios.delete(`/roles/${roleId}/members`, { data: payload });
    return response.data;
  } catch (error) {
    throw error;
  }
};

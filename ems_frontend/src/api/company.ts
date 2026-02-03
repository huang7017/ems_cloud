import axios from "../helper/axios";

// ==================== Types ====================

export interface Company {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  is_active: boolean;
  parent_id: number | null;
  children?: Company[];
  create_id: number;
  create_time: string;
  modify_id: number;
  modify_time: string;
}

export interface CompanyRequest {
  name: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface CreateManagerRequest {
  name: string;
  email: string;
  password: string;
}

export interface AddMemberRequest {
  member_id: number;
}

export interface AssignDeviceRequest {
  device_id: number;
  content?: object;
}

export interface CompanyMember {
  id: number;
  member_id: number;
  name: string;
  email: string;
  role: string;
}

export interface CompanyDevice {
  id: number;
  company_id: number;
  device_id: number;
  device_sn: string;
  content: object;
  create_id: number;
  create_time: string;
  modify_id: number;
  modify_time: string;
}

export interface CompanyTreeNode {
  company: Company;
  children: CompanyTreeNode[];
}

// ==================== API Functions ====================

// Company CRUD
export const fetchCompanies = async () => {
  const response = await axios.get("/companies");
  return response.data;
};

export const fetchCompanyById = async (id: number) => {
  const response = await axios.get(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (payload: CompanyRequest) => {
  const response = await axios.post("/companies", payload);
  return response.data;
};

export const updateCompany = async (id: number, payload: CompanyRequest) => {
  const response = await axios.put(`/companies/${id}`, payload);
  return response.data;
};

export const deleteCompany = async (id: number) => {
  const response = await axios.delete(`/companies/${id}`);
  return response.data;
};

// Company Tree
export const fetchCompanyTree = async (id: number) => {
  const response = await axios.get(`/companies/${id}/tree`);
  return response.data;
};

// Company Manager/User
export const createCompanyManager = async (
  companyId: number,
  payload: CreateManagerRequest
) => {
  const response = await axios.post(`/companies/${companyId}/manager`, payload);
  return response.data;
};

export const createCompanyUser = async (
  companyId: number,
  payload: CreateManagerRequest
) => {
  const response = await axios.post(`/companies/${companyId}/user`, payload);
  return response.data;
};

// Company Members
export const fetchCompanyMembers = async (companyId: number) => {
  const response = await axios.get(`/companies/${companyId}/members`);
  return response.data;
};

export const addCompanyMember = async (
  companyId: number,
  payload: AddMemberRequest
) => {
  const response = await axios.post(`/companies/${companyId}/members`, payload);
  return response.data;
};

export const removeCompanyMember = async (
  companyId: number,
  memberId: number
) => {
  const response = await axios.delete(
    `/companies/${companyId}/members/${memberId}`
  );
  return response.data;
};

// Company Devices
export const fetchCompanyDevices = async (companyId: number) => {
  const response = await axios.get(`/companies/${companyId}/devices`);
  return response.data;
};

export const assignCompanyDevice = async (
  companyId: number,
  payload: AssignDeviceRequest
) => {
  const response = await axios.post(`/companies/${companyId}/devices`, payload);
  return response.data;
};

export const removeCompanyDevice = async (
  companyId: number,
  deviceId: number
) => {
  const response = await axios.delete(
    `/companies/${companyId}/devices/${deviceId}`
  );
  return response.data;
};

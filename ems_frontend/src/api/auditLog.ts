import axios from "../helper/axios";

// Types
export interface AuditLog {
  id: number;
  member_id: number;
  role_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  status: string;
  error_message: string;
  create_time: string;
}

export interface AuditLogQueryParams {
  member_id?: number;
  role_id?: number;
  action?: string;
  resource_type?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogListResponse {
  total: number;
  logs: AuditLog[];
}

// API functions
export const fetchAuditLogs = async (params?: AuditLogQueryParams) => {
  try {
    const response = await axios.get("/audit-logs", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAuditLogById = async (id: number) => {
  try {
    const response = await axios.get(`/audit-logs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAuditLogsByMemberId = async (
  memberId: number,
  limit: number = 50,
  offset: number = 0
) => {
  try {
    const response = await axios.get(`/audit-logs/member/${memberId}`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchAuditLogsByResourceType = async (
  resourceType: string,
  limit: number = 50,
  offset: number = 0
) => {
  try {
    const response = await axios.get(`/audit-logs/resource/${resourceType}`, {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Alias for consistency
export const fetchAuditLogsApi = fetchAuditLogs;

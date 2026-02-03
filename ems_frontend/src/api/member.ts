import axios from "../helper/axios";

export interface MemberRole {
  id: number;
  name: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  is_enable: boolean;
  roles: MemberRole[];
}

export interface MemberApiResponse {
  success: boolean;
  data?: Member[] | Member;
  error?: string;
  message?: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  password: string;
  is_enable: boolean;
  role_ids: number[];
}

export interface MemberUpdateRequest {
  name: string;
  email: string;
  password?: string;
  is_enable: boolean;
  role_ids: number[];
}

// 獲取所有成員
export const fetchMembersApi = async (): Promise<MemberApiResponse> => {
  try {
    const response = await axios.get<MemberApiResponse>("/members");
    return response.data;
  } catch (error) {
    console.error("Fetch members API error:", error);
    throw new Error("Failed to fetch members");
  }
};

// 根據ID獲取成員
export const fetchMemberByIdApi = async (
  id: number
): Promise<MemberApiResponse> => {
  try {
    const response = await axios.get<MemberApiResponse>(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetch member API error:", error);
    throw new Error("Failed to fetch member");
  }
};

// 更新成員狀態
export const updateMemberStatusApi = async (
  id: number,
  isEnable: boolean
): Promise<MemberApiResponse> => {
  try {
    const response = await axios.put<MemberApiResponse>(
      `/members/${id}/status`,
      { is_enable: isEnable }
    );
    return response.data;
  } catch (error) {
    console.error("Update member status API error:", error);
    throw new Error("Failed to update member status");
  }
};

// 創建成員
export const createMemberApi = async (
  data: MemberCreateRequest
): Promise<MemberApiResponse> => {
  try {
    const response = await axios.post<MemberApiResponse>("/members", data);
    return response.data;
  } catch (error) {
    console.error("Create member API error:", error);
    throw new Error("Failed to create member");
  }
};

// 更新成員
export const updateMemberApi = async (
  id: number,
  data: MemberUpdateRequest
): Promise<MemberApiResponse> => {
  try {
    const response = await axios.put<MemberApiResponse>(`/members/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update member API error:", error);
    throw new Error("Failed to update member");
  }
};

// Alias for consistency
export const fetchMembers = fetchMembersApi;

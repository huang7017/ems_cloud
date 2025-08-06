export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "enabled" | "disabled";
  lastLogin: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
  checked: boolean;
}

export interface UserManagementState {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  activeTab: "users" | "roles" | "access";
  searchTerm: string;
}

export interface FetchUsersResponse {
  users: User[];
}

export interface FetchRolesResponse {
  roles: Role[];
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: "enabled" | "disabled";
}

export interface UpdateRoleRequest {
  id: string;
  name?: string;
  permissions?: Permission[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  status: "enabled" | "disabled";
}

export interface CreateRoleRequest {
  name: string;
  permissions: Permission[];
}

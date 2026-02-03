export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // Display string for table (comma-separated role names)
  roles: UserRole[]; // Actual role objects for editing
  status: "enabled" | "disabled";
  lastLogin: string;
  avatar?: string;
}

export interface Role {
  id: number;
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

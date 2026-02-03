export interface Company {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  is_active: boolean;
  parent_id: number | null;
  children?: Company[];
  create_id?: number;
  create_time?: string;
  modify_id?: number;
  modify_time?: string;
}

export interface CompanyRequest {
  name: string;
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  parent_id?: number | null;
  is_active?: boolean;
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
}

export interface CompanyTreeNode {
  company: Company;
  children: CompanyTreeNode[];
}

export interface CreateManagerRequest {
  name: string;
  email: string;
  password: string;
}

export interface AvailableDevice {
  id: number;
  sn: string;
}

export interface CompanyManagementState {
  companies: Company[];
  selectedCompany: Company | null;
  companyTree: CompanyTreeNode | null;
  companyMembers: CompanyMember[];
  companyDevices: CompanyDevice[];
  availableDevices: AvailableDevice[];
  loading: boolean;
  loadingMembers: boolean;
  loadingDevices: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  };
}

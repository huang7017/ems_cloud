import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CompanyManagementState,
  Company,
  CompanyRequest,
  CompanyMember,
  CompanyDevice,
  CompanyTreeNode,
  CreateManagerRequest,
  AvailableDevice,
} from "./types";

const initialState: CompanyManagementState = {
  companies: [],
  selectedCompany: null,
  companyTree: null,
  companyMembers: [],
  companyDevices: [],
  availableDevices: [],
  loading: false,
  loadingMembers: false,
  loadingDevices: false,
  error: null,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

const companyManagementSlice = createSlice({
  name: "companyManagement",
  initialState,
  reducers: {
    // Fetch companies
    fetchCompanies: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCompaniesSuccess: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
      state.loading = false;
    },
    fetchCompaniesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Create company
    createCompany: (state, _action: PayloadAction<CompanyRequest>) => {
      state.loading = true;
    },
    createCompanySuccess: (state, action: PayloadAction<Company>) => {
      state.companies.push(action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "公司創建成功",
        severity: "success",
      };
    },
    createCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Update company
    updateCompany: (
      state,
      _action: PayloadAction<{ id: number; data: CompanyRequest }>
    ) => {
      state.loading = true;
    },
    updateCompanySuccess: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "公司更新成功",
        severity: "success",
      };
    },
    updateCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Delete company
    deleteCompany: (state, _action: PayloadAction<number>) => {
      state.loading = true;
    },
    deleteCompanySuccess: (state, action: PayloadAction<number>) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "公司刪除成功",
        severity: "success",
      };
    },
    deleteCompanyFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Fetch company tree
    fetchCompanyTree: (state, _action: PayloadAction<number>) => {
      state.loading = true;
    },
    fetchCompanyTreeSuccess: (
      state,
      action: PayloadAction<CompanyTreeNode>
    ) => {
      state.companyTree = action.payload;
      state.loading = false;
    },
    fetchCompanyTreeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Company members
    fetchCompanyMembers: (state, _action: PayloadAction<number>) => {
      state.loadingMembers = true;
    },
    fetchCompanyMembersSuccess: (
      state,
      action: PayloadAction<CompanyMember[]>
    ) => {
      state.companyMembers = action.payload;
      state.loadingMembers = false;
    },
    fetchCompanyMembersFailure: (state, action: PayloadAction<string>) => {
      state.loadingMembers = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    addCompanyMember: (
      state,
      _action: PayloadAction<{ companyId: number; memberId: number }>
    ) => {
      state.loadingMembers = true;
    },
    addCompanyMemberSuccess: (state) => {
      state.loadingMembers = false;
      state.snackbar = {
        open: true,
        message: "成員添加成功",
        severity: "success",
      };
    },
    addCompanyMemberFailure: (state, action: PayloadAction<string>) => {
      state.loadingMembers = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    removeCompanyMember: (
      state,
      _action: PayloadAction<{ companyId: number; memberId: number }>
    ) => {
      state.loadingMembers = true;
    },
    removeCompanyMemberSuccess: (state, action: PayloadAction<number>) => {
      state.companyMembers = state.companyMembers.filter(
        (m) => m.member_id !== action.payload
      );
      state.loadingMembers = false;
      state.snackbar = {
        open: true,
        message: "成員移除成功",
        severity: "success",
      };
    },
    removeCompanyMemberFailure: (state, action: PayloadAction<string>) => {
      state.loadingMembers = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Create manager
    createCompanyManager: (
      state,
      _action: PayloadAction<{ companyId: number; data: CreateManagerRequest }>
    ) => {
      state.loading = true;
    },
    createCompanyManagerSuccess: (state) => {
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "管理員創建成功",
        severity: "success",
      };
    },
    createCompanyManagerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Create user
    createCompanyUser: (
      state,
      _action: PayloadAction<{ companyId: number; data: CreateManagerRequest }>
    ) => {
      state.loading = true;
    },
    createCompanyUserSuccess: (state) => {
      state.loading = false;
      state.snackbar = {
        open: true,
        message: "用戶創建成功",
        severity: "success",
      };
    },
    createCompanyUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Company devices
    fetchCompanyDevices: (state, _action: PayloadAction<number>) => {
      state.loadingDevices = true;
    },
    fetchCompanyDevicesSuccess: (
      state,
      action: PayloadAction<CompanyDevice[]>
    ) => {
      state.companyDevices = action.payload;
      state.loadingDevices = false;
    },
    fetchCompanyDevicesFailure: (state, action: PayloadAction<string>) => {
      state.loadingDevices = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    assignDevice: (
      state,
      _action: PayloadAction<{
        companyId: number;
        deviceId: number;
        content?: object;
      }>
    ) => {
      state.loadingDevices = true;
    },
    assignDeviceSuccess: (state) => {
      state.loadingDevices = false;
      state.snackbar = {
        open: true,
        message: "設備分配成功",
        severity: "success",
      };
    },
    assignDeviceFailure: (state, action: PayloadAction<string>) => {
      state.loadingDevices = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    removeDevice: (
      state,
      _action: PayloadAction<{ companyId: number; deviceId: number }>
    ) => {
      state.loadingDevices = true;
    },
    removeDeviceSuccess: (state, action: PayloadAction<number>) => {
      state.companyDevices = state.companyDevices.filter(
        (d) => d.device_id !== action.payload
      );
      state.loadingDevices = false;
      state.snackbar = {
        open: true,
        message: "設備移除成功",
        severity: "success",
      };
    },
    removeDeviceFailure: (state, action: PayloadAction<string>) => {
      state.loadingDevices = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // Fetch available devices (not yet assigned to any company)
    fetchAvailableDevices: (state) => {
      state.loading = true;
    },
    fetchAvailableDevicesSuccess: (state, action: PayloadAction<AvailableDevice[]>) => {
      state.availableDevices = action.payload;
      state.loading = false;
    },
    fetchAvailableDevicesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.snackbar = { open: true, message: action.payload, severity: "error" };
    },

    // UI actions
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
    clearCompanyMembers: (state) => {
      state.companyMembers = [];
    },
    clearCompanyDevices: (state) => {
      state.companyDevices = [];
    },
    clearAvailableDevices: (state) => {
      state.availableDevices = [];
    },
  },
});

export const {
  fetchCompanies,
  fetchCompaniesSuccess,
  fetchCompaniesFailure,
  createCompany,
  createCompanySuccess,
  createCompanyFailure,
  updateCompany,
  updateCompanySuccess,
  updateCompanyFailure,
  deleteCompany,
  deleteCompanySuccess,
  deleteCompanyFailure,
  fetchCompanyTree,
  fetchCompanyTreeSuccess,
  fetchCompanyTreeFailure,
  fetchCompanyMembers,
  fetchCompanyMembersSuccess,
  fetchCompanyMembersFailure,
  addCompanyMember,
  addCompanyMemberSuccess,
  addCompanyMemberFailure,
  removeCompanyMember,
  removeCompanyMemberSuccess,
  removeCompanyMemberFailure,
  createCompanyManager,
  createCompanyManagerSuccess,
  createCompanyManagerFailure,
  createCompanyUser,
  createCompanyUserSuccess,
  createCompanyUserFailure,
  fetchCompanyDevices,
  fetchCompanyDevicesSuccess,
  fetchCompanyDevicesFailure,
  assignDevice,
  assignDeviceSuccess,
  assignDeviceFailure,
  removeDevice,
  removeDeviceSuccess,
  removeDeviceFailure,
  fetchAvailableDevices,
  fetchAvailableDevicesSuccess,
  fetchAvailableDevicesFailure,
  setSelectedCompany,
  closeSnackbar,
  clearCompanyMembers,
  clearCompanyDevices,
  clearAvailableDevices,
} = companyManagementSlice.actions;

export default companyManagementSlice.reducer;

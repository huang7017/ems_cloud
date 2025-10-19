import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DashboardState, DashboardQueryParams, TimeRange } from "./types";
import type {
  DashboardCompaniesResponse,
  DashboardCompanyAreasResponse,
  DashboardSummaryResponse,
  DashboardMeterResponse,
  DashboardTemperatureResponse,
  DashboardAreaResponse,
} from "../../api/home/dashboard";

export const initialState: DashboardState = {
  // Loading states
  loading: false,
  companiesLoading: false,
  companyAreasLoading: false,
  summaryLoading: false,
  metersLoading: false,
  temperaturesLoading: false,
  areasLoading: false,

  // Error states
  error: null,
  companiesError: null,
  companyAreasError: null,
  summaryError: null,
  metersError: null,
  temperaturesError: null,
  areasError: null,

  // Lists
  companiesList: [],
  companyAreasList: [],

  // Data
  summary: null,
  meters: null,
  temperatures: null,
  areas: null,

  // Selections
  selectedCompanyId: null,
  selectedAreaId: null,
  selectedTimeRange: "daily",
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    // ==================== Global Actions ====================
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSelectedCompanyId(state, action: PayloadAction<number | null>) {
      state.selectedCompanyId = action.payload;
      // Reset area selection when company changes
      state.selectedAreaId = null;
      state.companyAreasList = [];
    },
    setSelectedAreaId(state, action: PayloadAction<string | null>) {
      state.selectedAreaId = action.payload;
    },
    setSelectedTimeRange(state, action: PayloadAction<TimeRange>) {
      state.selectedTimeRange = action.payload;
    },

    // ==================== Companies List Actions ====================
    fetchCompaniesList(state) {
      state.companiesLoading = true;
      state.companiesError = null;
    },
    fetchCompaniesListSuccess(state, action: PayloadAction<DashboardCompaniesResponse>) {
      state.companiesLoading = false;
      state.companiesError = null;
      if (action.payload.data) {
        state.companiesList = action.payload.data.companies;
        // Auto-select first company if none selected
        if (!state.selectedCompanyId && action.payload.data.companies.length > 0) {
          state.selectedCompanyId = action.payload.data.companies[0].company_id;
        }
      }
    },
    fetchCompaniesListFailure(state, action: PayloadAction<string>) {
      state.companiesLoading = false;
      state.companiesError = action.payload;
    },

    // ==================== Company Areas List Actions ====================
    fetchCompanyAreasList(state, _action: PayloadAction<{ company_id: number }>) {
      state.companyAreasLoading = true;
      state.companyAreasError = null;
    },
    fetchCompanyAreasListSuccess(state, action: PayloadAction<DashboardCompanyAreasResponse>) {
      state.companyAreasLoading = false;
      state.companyAreasError = null;
      if (action.payload.data) {
        state.companyAreasList = action.payload.data.areas;
        // Reset area selection to "all areas"
        state.selectedAreaId = null;
      }
    },
    fetchCompanyAreasListFailure(state, action: PayloadAction<string>) {
      state.companyAreasLoading = false;
      state.companyAreasError = action.payload;
    },

    // ==================== Summary Actions ====================
    fetchSummary(state) {
      state.summaryLoading = true;
      state.summaryError = null;
    },
    fetchSummarySuccess(state, action: PayloadAction<DashboardSummaryResponse>) {
      state.summaryLoading = false;
      state.summaryError = null;
      if (action.payload.data) {
        state.summary = action.payload.data;
        // Auto-select first company if none selected
        if (!state.selectedCompanyId && action.payload.data.companies.length > 0) {
          state.selectedCompanyId = action.payload.data.companies[0].company_id;
        }
      }
    },
    fetchSummaryFailure(state, action: PayloadAction<string>) {
      state.summaryLoading = false;
      state.summaryError = action.payload;
    },

    // ==================== Meters Actions ====================
    fetchMeters(state, _action: PayloadAction<DashboardQueryParams | undefined>) {
      state.metersLoading = true;
      state.metersError = null;
    },
    fetchMetersSuccess(state, action: PayloadAction<DashboardMeterResponse>) {
      state.metersLoading = false;
      state.metersError = null;
      if (action.payload.data) {
        state.meters = action.payload.data;
      }
    },
    fetchMetersFailure(state, action: PayloadAction<string>) {
      state.metersLoading = false;
      state.metersError = action.payload;
    },

    // ==================== Temperatures Actions ====================
    fetchTemperatures(state, _action: PayloadAction<DashboardQueryParams | undefined>) {
      state.temperaturesLoading = true;
      state.temperaturesError = null;
    },
    fetchTemperaturesSuccess(state, action: PayloadAction<DashboardTemperatureResponse>) {
      state.temperaturesLoading = false;
      state.temperaturesError = null;
      if (action.payload.data) {
        state.temperatures = action.payload.data;
      }
    },
    fetchTemperaturesFailure(state, action: PayloadAction<string>) {
      state.temperaturesLoading = false;
      state.temperaturesError = action.payload;
    },

    // ==================== Areas Actions ====================
    fetchAreas(state, _action: PayloadAction<{ company_id: number }>) {
      state.areasLoading = true;
      state.areasError = null;
    },
    fetchAreasSuccess(state, action: PayloadAction<DashboardAreaResponse>) {
      state.areasLoading = false;
      state.areasError = null;
      if (action.payload.data) {
        state.areas = action.payload.data;
      }
    },
    fetchAreasFailure(state, action: PayloadAction<string>) {
      state.areasLoading = false;
      state.areasError = action.payload;
    },

    // ==================== Combined Fetch Action ====================
    // Fetch all dashboard data at once
    fetchAllDashboardData(state, _action: PayloadAction<DashboardQueryParams | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchAllDashboardDataSuccess(state) {
      state.loading = false;
      state.error = null;
    },
    fetchAllDashboardDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset state
    resetDashboard() {
      return initialState;
    },
  },
});

export const { actions, reducer } = homeSlice;

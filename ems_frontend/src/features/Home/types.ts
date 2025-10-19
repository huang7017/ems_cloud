import type {
  CompanySummaryInfo,
  CompanyMeterInfo,
  CompanyTemperatureInfo,
  AreaInfo,
  CompanyListItem,
  AreaListItem,
} from "../../api/home/dashboard";

// Dashboard State
export interface DashboardState {
  // Loading states
  loading: boolean;
  companiesLoading: boolean;
  companyAreasLoading: boolean;
  summaryLoading: boolean;
  metersLoading: boolean;
  temperaturesLoading: boolean;
  areasLoading: boolean;

  // Error states
  error: string | null;
  companiesError: string | null;
  companyAreasError: string | null;
  summaryError: string | null;
  metersError: string | null;
  temperaturesError: string | null;
  areasError: string | null;

  // Companies list (for dropdown)
  companiesList: CompanyListItem[];

  // Company areas list (for dropdown)
  companyAreasList: AreaListItem[];

  // Summary data
  summary: {
    total_companies: number;
    total_devices: number;
    companies: CompanySummaryInfo[];
  } | null;

  // Meters data
  meters: {
    companies: CompanyMeterInfo[];
  } | null;

  // Temperatures data
  temperatures: {
    companies: CompanyTemperatureInfo[];
  } | null;

  // Areas data (for selected company)
  areas: {
    company_id: number;
    company_name: string;
    areas: AreaInfo[];
  } | null;

  // Current selections
  selectedCompanyId: number | null;
  selectedAreaId: string | null;
  selectedTimeRange: TimeRange;
}

// Time range options
export type TimeRange = "daily" | "weekly" | "monthly" | "custom";

// Query parameters for fetching data
export interface DashboardQueryParams {
  company_id?: number;
  start_time?: string;
  end_time?: string;
}


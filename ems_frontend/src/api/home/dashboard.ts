import axios from "../../helper/axios";

// ==================== Types ====================

// Companies List API Types
export interface CompanyListItem {
  company_id: number;
  company_name: string;
  is_active: boolean;
}

export interface DashboardCompaniesResponse {
  success: boolean;
  data?: {
    companies: CompanyListItem[];
  };
  error?: string;
}

// Company Areas List API Types
export interface AreaListItem {
  area_id: string;
  area_name: string;
}

export interface DashboardCompanyAreasRequest {
  company_id: number;
}

export interface DashboardCompanyAreasResponse {
  success: boolean;
  data?: {
    company_id: number;
    areas: AreaListItem[];
  };
  error?: string;
}

// Summary API Types
export interface CompanySummaryInfo {
  company_id: number;
  company_name: string;
  device_count: number;
  total_k_wh: number;
  total_kw: number;
  last_updated_at?: string;
}

export interface DashboardSummaryResponse {
  success: boolean;
  data?: {
    total_companies: number;
    total_devices: number;
    companies: CompanySummaryInfo[];
  };
  error?: string;
}

// Meter API Types
export interface MeterReading {
  timestamp: string;
  k_wh: number;
  kw: number;
}

export interface MeterInfo {
  meter_id: string;
  latest_data?: MeterReading;
  history_data?: MeterReading[];
}

export interface AreaMeterInfo {
  area_id: string;
  area_name: string;
  meters: MeterInfo[];
}

export interface CompanyMeterInfo {
  company_id: number;
  company_name: string;
  areas: AreaMeterInfo[];
}

export interface DashboardMeterRequest {
  company_id?: number;
  start_time?: string;
  end_time?: string;
}

export interface DashboardMeterResponse {
  success: boolean;
  data?: {
    companies: CompanyMeterInfo[];
  };
  error?: string;
}

// Temperature API Types
export interface TemperatureReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  heat_index: number;
}

export interface TemperatureSensorInfo {
  sensor_id: string;
  latest_data?: TemperatureReading;
  history_data?: TemperatureReading[];
}

export interface AreaTemperatureInfo {
  area_id: string;
  area_name: string;
  sensors: TemperatureSensorInfo[];
}

export interface CompanyTemperatureInfo {
  company_id: number;
  company_name: string;
  areas: AreaTemperatureInfo[];
}

export interface DashboardTemperatureRequest {
  company_id?: number;
  start_time?: string;
  end_time?: string;
}

export interface DashboardTemperatureResponse {
  success: boolean;
  data?: {
    companies: CompanyTemperatureInfo[];
  };
  error?: string;
}

// Area Overview API Types
export interface AreaStatistics {
  total_meters: number;
  total_k_wh: number;
  total_kw: number;
  total_sensors: number;
  avg_temperature: number;
  avg_humidity: number;
  avg_heat_index: number;
  min_temperature: number;
  max_temperature: number;
  total_ac_packages: number;
  running_ac_count: number;
  last_updated_at?: string;
}

export interface ACPackageInfo {
  package_id: string;
  package_name: string;
  // compressors removed as per requirements
}

export interface AreaInfo {
  area_id: string;
  area_name: string;
  statistics: AreaStatistics;
  meters: MeterInfo[];
  sensors: TemperatureSensorInfo[];
  ac_packages: ACPackageInfo[];
}

export interface DashboardAreaRequest {
  company_id: number;
}

export interface DashboardAreaResponse {
  success: boolean;
  data?: {
    company_id: number;
    company_name: string;
    areas: AreaInfo[];
  };
  error?: string;
}

// ==================== API Functions ====================

/**
 * 获取公司列表
 * 获取用户有权限访问的公司列表，用于下拉选单
 */
export const fetchDashboardCompaniesApi = async (): Promise<DashboardCompaniesResponse> => {
  try {
    const response = await axios.get<DashboardCompaniesResponse>("/dashboard/companies");
    return response.data;
  } catch (error) {
    console.error("Dashboard Companies API Error:", error);
    throw error;
  }
};

/**
 * 获取公司的区域列表
 * @param params - 查询参数 (company_id 必填)
 */
export const fetchDashboardCompanyAreasApi = async (
  params: DashboardCompanyAreasRequest
): Promise<DashboardCompanyAreasResponse> => {
  try {
    const response = await axios.get<DashboardCompanyAreasResponse>("/dashboard/company/areas", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard Company Areas API Error:", error);
    throw error;
  }
};

/**
 * 获取 Dashboard 总览
 * 获取用户所有关联公司的总览数据
 */
export const fetchDashboardSummaryApi = async (): Promise<DashboardSummaryResponse> => {
  try {
    const response = await axios.get<DashboardSummaryResponse>("/dashboard/summary");
    return response.data;
  } catch (error) {
    console.error("Dashboard Summary API Error:", error);
    throw error;
  }
};

/**
 * 获取电表数据
 * @param params - 查询参数 (company_id, start_time, end_time)
 */
export const fetchDashboardMetersApi = async (
  params?: DashboardMeterRequest
): Promise<DashboardMeterResponse> => {
  try {
    const response = await axios.get<DashboardMeterResponse>("/dashboard/meters", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard Meters API Error:", error);
    throw error;
  }
};

/**
 * 获取温度、湿度、体感数据
 * @param params - 查询参数 (company_id, start_time, end_time)
 */
export const fetchDashboardTemperaturesApi = async (
  params?: DashboardTemperatureRequest
): Promise<DashboardTemperatureResponse> => {
  try {
    const response = await axios.get<DashboardTemperatureResponse>("/dashboard/temperatures", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard Temperatures API Error:", error);
    throw error;
  }
};

/**
 * 获取区域总览（区域解构视图）
 * @param params - 查询参数 (company_id 必填)
 */
export const fetchDashboardAreasApi = async (
  params: DashboardAreaRequest
): Promise<DashboardAreaResponse> => {
  try {
    const response = await axios.get<DashboardAreaResponse>("/dashboard/areas", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard Areas API Error:", error);
    throw error;
  }
};

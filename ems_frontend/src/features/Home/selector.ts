import { createSelector } from "@reduxjs/toolkit";
import { initialState } from "./reducer";
import type { IState } from "../../store/reducers";

const homeState = (state: IState) => state.home || initialState;

// ==================== Loading Selectors ====================
export const loadingSelector = createSelector(homeState, (state) => state.loading);
export const companiesLoadingSelector = createSelector(homeState, (state) => state.companiesLoading);
export const companyAreasLoadingSelector = createSelector(
  homeState,
  (state) => state.companyAreasLoading
);
export const summaryLoadingSelector = createSelector(homeState, (state) => state.summaryLoading);
export const metersLoadingSelector = createSelector(homeState, (state) => state.metersLoading);
export const temperaturesLoadingSelector = createSelector(
  homeState,
  (state) => state.temperaturesLoading
);
export const areasLoadingSelector = createSelector(homeState, (state) => state.areasLoading);

// ==================== Error Selectors ====================
export const errorSelector = createSelector(homeState, (state) => state.error);
export const companiesErrorSelector = createSelector(homeState, (state) => state.companiesError);
export const companyAreasErrorSelector = createSelector(
  homeState,
  (state) => state.companyAreasError
);
export const summaryErrorSelector = createSelector(homeState, (state) => state.summaryError);
export const metersErrorSelector = createSelector(homeState, (state) => state.metersError);
export const temperaturesErrorSelector = createSelector(
  homeState,
  (state) => state.temperaturesError
);
export const areasErrorSelector = createSelector(homeState, (state) => state.areasError);

// ==================== Data Selectors ====================
export const companiesListSelector = createSelector(homeState, (state) => state.companiesList);
export const companyAreasListSelector = createSelector(
  homeState,
  (state) => state.companyAreasList
);
export const summarySelector = createSelector(homeState, (state) => state.summary);
export const metersSelector = createSelector(homeState, (state) => state.meters);
export const temperaturesSelector = createSelector(homeState, (state) => state.temperatures);
export const areasSelector = createSelector(homeState, (state) => state.areas);

// ==================== Selection Selectors ====================
export const selectedCompanyIdSelector = createSelector(
  homeState,
  (state) => state.selectedCompanyId
);
export const selectedAreaIdSelector = createSelector(homeState, (state) => state.selectedAreaId);
export const selectedTimeRangeSelector = createSelector(
  homeState,
  (state) => state.selectedTimeRange
);

// ==================== Computed Selectors ====================

// Get total companies count
export const totalCompaniesSelector = createSelector(
  summarySelector,
  (summary) => summary?.total_companies || 0
);

// Get total devices count
export const totalDevicesSelector = createSelector(
  summarySelector,
  (summary) => summary?.total_devices || 0
);

// Get selected company data from companies list
export const selectedCompanySelector = createSelector(
  [companiesListSelector, selectedCompanyIdSelector],
  (companies, selectedId) => {
    if (!selectedId) return null;
    return companies.find((company) => company.company_id === selectedId) || null;
  }
);

// Get meters history data for selected company
export const selectedCompanyMetersHistorySelector = createSelector(
  [metersSelector, selectedCompanyIdSelector],
  (meters, selectedId) => {
    if (!meters || !selectedId) return [];
    const company = meters.companies.find((c) => c.company_id === selectedId);
    if (!company) return [];
    
    // Collect all history data from all areas and meters
    const historyData: Array<{
      timestamp: string;
      k_wh: number;
      kw: number;
      meter_id: string;
      area_name: string;
    }> = [];
    
    company.areas.forEach((area) => {
      area.meters.forEach((meter) => {
        if (meter.history_data) {
          meter.history_data.forEach((data) => {
            historyData.push({
              ...data,
              meter_id: meter.meter_id,
              area_name: area.area_name,
            });
          });
        }
      });
    });
    
    // Sort by timestamp descending
    return historyData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
);

// Get temperatures history data for selected company
export const selectedCompanyTemperaturesHistorySelector = createSelector(
  [temperaturesSelector, selectedCompanyIdSelector],
  (temperatures, selectedId) => {
    if (!temperatures || !selectedId) return [];
    const company = temperatures.companies.find((c) => c.company_id === selectedId);
    if (!company) return [];
    
    // Collect all history data from all areas and sensors
    const historyData: Array<{
      timestamp: string;
      temperature: number;
      humidity: number;
      heat_index: number;
      sensor_id: string;
      area_name: string;
    }> = [];
    
    company.areas.forEach((area) => {
      area.sensors.forEach((sensor) => {
        if (sensor.history_data) {
          sensor.history_data.forEach((data) => {
            historyData.push({
              ...data,
              sensor_id: sensor.sensor_id,
              area_name: area.area_name,
            });
          });
        }
      });
    });
    
    // Sort by timestamp descending
    return historyData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
);

// Get selected area data from areas list
export const selectedAreaSelector = createSelector(
  [companyAreasListSelector, selectedAreaIdSelector],
  (areas, selectedId) => {
    if (!selectedId) return null;
    return areas.find((area) => area.area_id === selectedId) || null;
  }
);

// Get filtered areas based on selected area
export const filteredAreasSelector = createSelector(
  [areasSelector, selectedAreaIdSelector],
  (areasData, selectedAreaId) => {
    if (!areasData) return null;
    if (!selectedAreaId) return areasData; // Return all areas if no area selected
    
    // Filter to show only selected area
    return {
      ...areasData,
      areas: areasData.areas.filter((area) => area.area_id === selectedAreaId),
    };
  }
);

// Get total electricity usage across all companies (from summary)
export const totalElectricityUsageSelector = createSelector(summarySelector, (summary) => {
  if (!summary) return 0;
  return summary.companies.reduce((total, company) => total + (company.total_k_wh || 0), 0);
});

// Get total power across all companies (from summary)
export const totalPowerSelector = createSelector(summarySelector, (summary) => {
  if (!summary) return 0;
  return summary.companies.reduce((total, company) => total + (company.total_kw || 0), 0);
});

// Get meters for selected company
export const selectedCompanyMetersSelector = createSelector(
  [metersSelector, selectedCompanyIdSelector],
  (meters, selectedId) => {
    if (!meters || !selectedId) return null;
    return meters.companies.find((company) => company.company_id === selectedId) || null;
  }
);

// Get temperatures for selected company
export const selectedCompanyTemperaturesSelector = createSelector(
  [temperaturesSelector, selectedCompanyIdSelector],
  (temperatures, selectedId) => {
    if (!temperatures || !selectedId) return null;
    return temperatures.companies.find((company) => company.company_id === selectedId) || null;
  }
);

// Get average temperature across all sensors
export const averageTemperatureSelector = createSelector(temperaturesSelector, (temperatures) => {
  if (!temperatures) return null;

  let totalTemp = 0;
  let count = 0;

  temperatures.companies.forEach((company) => {
    company.areas.forEach((area) => {
      area.sensors.forEach((sensor) => {
        if (sensor.latest_data) {
          totalTemp += sensor.latest_data.temperature;
          count++;
        }
      });
    });
  });

  return count > 0 ? totalTemp / count : null;
});

// Get average humidity across all sensors
export const averageHumiditySelector = createSelector(temperaturesSelector, (temperatures) => {
  if (!temperatures) return null;

  let totalHumidity = 0;
  let count = 0;

  temperatures.companies.forEach((company) => {
    company.areas.forEach((area) => {
      area.sensors.forEach((sensor) => {
        if (sensor.latest_data) {
          totalHumidity += sensor.latest_data.humidity;
          count++;
        }
      });
    });
  });

  return count > 0 ? totalHumidity / count : null;
});

// Get average heat index across all sensors
export const averageHeatIndexSelector = createSelector(temperaturesSelector, (temperatures) => {
  if (!temperatures) return null;

  let totalHeatIndex = 0;
  let count = 0;

  temperatures.companies.forEach((company) => {
    company.areas.forEach((area) => {
      area.sensors.forEach((sensor) => {
        if (sensor.latest_data) {
          totalHeatIndex += sensor.latest_data.heat_index;
          count++;
        }
      });
    });
  });

  return count > 0 ? totalHeatIndex / count : null;
});

// Get total running AC count from areas data
export const totalRunningACSelector = createSelector(areasSelector, (areas) => {
  if (!areas) return 0;
  return areas.areas.reduce((total, area) => total + area.statistics.running_ac_count, 0);
});

// Get total AC packages from areas data
export const totalACPackagesSelector = createSelector(areasSelector, (areas) => {
  if (!areas) return 0;
  return areas.areas.reduce((total, area) => total + area.statistics.total_ac_packages, 0);
});

// Check if any data is loading
export const anyLoadingSelector = createSelector(
  [
    companiesLoadingSelector,
    companyAreasLoadingSelector,
    summaryLoadingSelector,
    metersLoadingSelector,
    temperaturesLoadingSelector,
    areasLoadingSelector,
  ],
  (
    companiesLoading,
    companyAreasLoading,
    summaryLoading,
    metersLoading,
    temperaturesLoading,
    areasLoading
  ) => {
    return (
      companiesLoading ||
      companyAreasLoading ||
      summaryLoading ||
      metersLoading ||
      temperaturesLoading ||
      areasLoading
    );
  }
);

// Check if any error exists
export const anyErrorSelector = createSelector(
  [
    companiesErrorSelector,
    companyAreasErrorSelector,
    summaryErrorSelector,
    metersErrorSelector,
    temperaturesErrorSelector,
    areasErrorSelector,
  ],
  (companiesError, companyAreasError, summaryError, metersError, temperaturesError, areasError) => {
    return (
      companiesError ||
      companyAreasError ||
      summaryError ||
      metersError ||
      temperaturesError ||
      areasError
    );
  }
);

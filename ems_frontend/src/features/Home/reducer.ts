import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { VrfSystem, VrfSensor } from "./types";

// 比對結果的類型
export interface CompareResult {
  chart1: any[];
  chart2: any[];
  humidityChart1: any[];
  humidityChart2: any[];
  heatIndexChart1: any[];
  heatIndexChart2: any[];
  meterChart1: any[];
  meterChart2: any[];
  avg1: number;
  avg2: number;
  avgHumidity1: number;
  avgHumidity2: number;
  avgHeatIndex1: number;
  avgHeatIndex2: number;
  savingPercent: number;
  wattRange1: number;
  wattRange2: number;
  vrfSensorDetails: VrfSensor[] | null;
  meterData1Count: number;
  meterData2Count: number;
}

export const initialState = {
  loading: false as boolean,
  compareLoading: false as boolean,
  dataInitialized: false as boolean,
  vrfSystems: [] as VrfSystem[],
  vrfSensors: {} as Record<string, VrfSensor[]>,
  // 比對數據
  compareResult: null as CompareResult | null,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    fetchVrfData(state) {
      state.loading = true;
      state.dataInitialized = false;
    },
    setVrfSystems(state, action: PayloadAction<VrfSystem[]>) {
      state.vrfSystems = action.payload;
    },
    setVrfSensors(state, action: PayloadAction<{ vrfId: string, sensors: VrfSensor[] }>) {
      state.vrfSensors[action.payload.vrfId] = action.payload.sensors;
    },
    setDataInitialized(state) {
      state.dataInitialized = true;
      state.loading = false;
    },
    // 比對相關的 actions
    fetchCompareData(state, _action: PayloadAction<{
      vrfId: string;
      meterId: string;
      period1: { start: string; end: string };
      period2: { start: string; end: string };
      energySavingPeriod: 'period1' | 'period2';
    }>) {
      state.compareLoading = true;
      state.compareResult = null;
    },
    setCompareResult(state, action: PayloadAction<CompareResult>) {
      state.compareResult = action.payload;
      state.compareLoading = false;
    },
    setCompareLoading(state, action: PayloadAction<boolean>) {
      state.compareLoading = action.payload;
    },
  },
});

export const { actions, reducer } = homeSlice;


import { call, put, takeLatest, select } from "redux-saga/effects";
import { actions } from "./reducer";
import type { MeterResponse, VrfSystem, VrfSensor, TemperatureReading } from "./types";
import { getVrfSystems, getVrfSensors, getSensorReadingsByTimeRange, getMeterDataByTimeRange } from "../../api/home/dashboard";
import { vrfSensorsSelector, dataInitializedSelector } from "./selector";
import type { CompareResult } from "./reducer";

const VrfDataSaga = function* () {
  try {
    // 檢查是否已經初始化過數據
    const dataInitialized: boolean = yield select(dataInitializedSelector);
    if (dataInitialized) {
      console.log('數據已經初始化過，跳過載入');
      return;
    }

    // 先載入 VRF 系統
    const vrfSystems: VrfSystem[] = yield call(getVrfSystems);
    yield put(actions.setVrfSystems(vrfSystems));

    // 順序載入每個 VRF 的感測器（避免並行造成資料庫鎖定）
    for (const system of vrfSystems) {
      yield call(fetchSensorsForVrf, system.id);
    }
    
    // 標記數據已初始化
    yield put(actions.setDataInitialized());
    
  } catch (error) {
    console.error("Error fetching VRF data:", error);
    yield put(actions.setLoading(false));
  }
};

const fetchSensorsForVrf = function* (vrfId: string) {
  try {
    const sensors: VrfSensor[] = yield call(getVrfSensors, vrfId);
    yield put(actions.setVrfSensors({ vrfId, sensors }));
  } catch (error) {
    console.error(`Error in fetchSensorsForVrf for ${vrfId}:`, error);
  }
}

// 比對資料載入 saga
const CompareDataSaga = function* (action: any) {
  try {
    const { vrfId, meterId, period1, period2, energySavingPeriod } = action.payload;
    
    console.log('=== Saga 開始載入比對資料 ===');
    
    // 取得該 VRF 的感測器列表
    const vrfSensors: Record<string, VrfSensor[]> = yield select(vrfSensorsSelector);
    const sensorList = vrfSensors[vrfId] || [];
    
    // 載入感測器資料
    const sensorReadings1: Record<string, TemperatureReading[]> = {};
    const sensorReadings2: Record<string, TemperatureReading[]> = {};
    
    for (const sensor of sensorList) {
      const sensorId = sensor.temperature_sensor_id;
      
      try {
        const readings1: TemperatureReading[] = yield call(
          getSensorReadingsByTimeRange, 
          sensorId, 
          period1.start, 
          period1.end
        );
        sensorReadings1[sensorId] = readings1;
      } catch (error) {
        console.error(`載入感測器 ${sensorId} 期間1 失敗:`, error);
        sensorReadings1[sensorId] = [];
      }
      
      try {
        const readings2: TemperatureReading[] = yield call(
          getSensorReadingsByTimeRange, 
          sensorId, 
          period2.start, 
          period2.end
        );
        sensorReadings2[sensorId] = readings2;
      } catch (error) {
        console.error(`載入感測器 ${sensorId} 期間2 失敗:`, error);
        sensorReadings2[sensorId] = [];
      }
    }
    
    // 載入電表資料
    let meterData1: MeterResponse[] = [];
    let meterData2: MeterResponse[] = [];
    
    try {
      meterData1 = yield call(getMeterDataByTimeRange, meterId, period1.start, period1.end);
    } catch (error) {
      console.error('載入電表期間1失敗:', error);
    }
    
    try {
      meterData2 = yield call(getMeterDataByTimeRange, meterId, period2.start, period2.end);
    } catch (error) {
      console.error('載入電表期間2失敗:', error);
    }
    
    // 計算比對結果
    yield call(calculateCompareResult, vrfId, energySavingPeriod, sensorReadings1, sensorReadings2, meterData1, meterData2, sensorList);
    
  } catch (error) {
    console.error('CompareDataSaga error:', error);
    yield put(actions.setCompareLoading(false));
  }
};

// 計算比對結果
const calculateCompareResult = function* (
  vrfId: string, 
  energySavingPeriod: 'period1' | 'period2',
  sensorReadings1: Record<string, TemperatureReading[]>,
  sensorReadings2: Record<string, TemperatureReading[]>,
  meterData1: MeterResponse[],
  meterData2: MeterResponse[],
  sensorList: VrfSensor[]
) {
  try {
    const vrfSystems: VrfSystem[] = yield select((state: any) => state.home.vrfSystems);
    
    const selectedVrfSystem = vrfSystems.find((v: VrfSystem) => v.id === vrfId);
    const vrfSensorDetails = sensorList.length > 0 ? sensorList : null;
    
    // 處理溫度資料
    const processTemperatureData = (readings: Record<string, TemperatureReading[]>) => {
      const allData: { x: Date; y: number }[] = [];
      
      Object.values(readings).forEach(sensorReadings => {
        sensorReadings.forEach(reading => {
          allData.push({
            x: new Date(reading.read_at),
            y: reading.temperature
          });
        });
      });
      
      return allData.sort((a, b) => a.x.getTime() - b.x.getTime());
    };

    // 處理濕度資料
    const processHumidityData = (readings: Record<string, TemperatureReading[]>) => {
      const allData: { x: Date; y: number }[] = [];
      
      Object.values(readings).forEach(sensorReadings => {
        sensorReadings.forEach(reading => {
          allData.push({
            x: new Date(reading.read_at),
            y: reading.humidity
          });
        });
      });
      
      return allData.sort((a, b) => a.x.getTime() - b.x.getTime());
    };

    // 處理體感溫度資料
    const processHeatIndexData = (readings: Record<string, TemperatureReading[]>) => {
      const allData: { x: Date; y: number }[] = [];
      
      Object.values(readings).forEach(sensorReadings => {
        sensorReadings.forEach(reading => {
          allData.push({
            x: new Date(reading.read_at),
            y: reading.heat_index
          });
        });
      });
      
      return allData.sort((a, b) => a.x.getTime() - b.x.getTime());
    };
    
    const tempData1 = processTemperatureData(sensorReadings1);
    const tempData2 = processTemperatureData(sensorReadings2);
    const humidityData1 = processHumidityData(sensorReadings1);
    const humidityData2 = processHumidityData(sensorReadings2);
    const heatIndexData1 = processHeatIndexData(sensorReadings1);
    const heatIndexData2 = processHeatIndexData(sensorReadings2);
    
    // 計算平均值和統計
    const avgTemp1 = tempData1.length > 0 
      ? tempData1.reduce((sum, item) => sum + item.y, 0) / tempData1.length 
      : 0;
    const avgTemp2 = tempData2.length > 0 
      ? tempData2.reduce((sum, item) => sum + item.y, 0) / tempData2.length 
      : 0;

    const avgHumidity1 = humidityData1.length > 0 
      ? humidityData1.reduce((sum, item) => sum + item.y, 0) / humidityData1.length 
      : 0;
    const avgHumidity2 = humidityData2.length > 0 
      ? humidityData2.reduce((sum, item) => sum + item.y, 0) / humidityData2.length 
      : 0;

    const avgHeatIndex1 = heatIndexData1.length > 0 
      ? heatIndexData1.reduce((sum, item) => sum + item.y, 0) / heatIndexData1.length 
      : 0;
    const avgHeatIndex2 = heatIndexData2.length > 0 
      ? heatIndexData2.reduce((sum, item) => sum + item.y, 0) / heatIndexData2.length 
      : 0;
    
    // 用電圖表（轉換為瞬間功率）
    const processMeterData = (meterData: MeterResponse[]) => {
      if (meterData.length < 2) return [];
      
      const sortedData = [...meterData].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const powerData: { x: Date; y: number }[] = [];
      
      for (let i = 1; i < sortedData.length; i++) {
        const current = sortedData[i];
        const previous = sortedData[i - 1];
        
        // 計算時間差（小時）
        const timeDiff = (new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60);
        
        if (timeDiff > 0) {
          // 計算瞬間功率 = (當前總電量 - 前一筆總電量) / 時間差
          const instantPower = (current.total_watt - previous.total_watt) / timeDiff;
          
          powerData.push({
            x: new Date(current.timestamp),
            y: Math.max(0, instantPower) // 確保不為負值
          });
        }
      }
      
      return powerData;
    };
    
    const meterPowerData1 = processMeterData(meterData1);
    const meterPowerData2 = processMeterData(meterData2);
    

    
    // 計算總耗電量（期間內最大累積電量 - 最小累積電量）
    const totalConsumption1 = meterData1.length > 0 
      ? Math.max(...meterData1.map(m => m.total_watt)) - Math.min(...meterData1.map(m => m.total_watt))
      : 0;
    const totalConsumption2 = meterData2.length > 0 
      ? Math.max(...meterData2.map(m => m.total_watt)) - Math.min(...meterData2.map(m => m.total_watt))
      : 0;
    
    // 計算省電效果（基於總耗電量的減少百分比）
    let savingPercent = 0;
    let baseConsumption = 0;
    let energyConsumption = 0;
    
    if (energySavingPeriod === 'period1') {
      // 區間1是節能期間，區間2是基準期間
      baseConsumption = totalConsumption2;
      energyConsumption = totalConsumption1;
    } else {
      // 區間2是節能期間，區間1是基準期間
      baseConsumption = totalConsumption1;
      energyConsumption = totalConsumption2;
    }
    
    if (baseConsumption > 0) {
      savingPercent = ((baseConsumption - energyConsumption) / baseConsumption) * 100;
    }
    
    // 格式化圖表資料
    const systemAddress = selectedVrfSystem?.address || 'Unknown';
    
    // 溫度圖表
    const chart1Data = [
      {
        id: `${systemAddress} 溫度`,
        data: tempData1,
      },
    ];
    
    const chart2Data = [
      {
        id: `${systemAddress} 溫度`,
        data: tempData2,
      },
    ];

    // 濕度圖表
    const humidityChart1Data = [
      {
        id: `${systemAddress} 濕度`,
        data: humidityData1,
      },
    ];
    
    const humidityChart2Data = [
      {
        id: `${systemAddress} 濕度`,
        data: humidityData2,
      },
    ];

    // 體感溫度圖表
    const heatIndexChart1Data = [
      {
        id: `${systemAddress} 體感溫度`,
        data: heatIndexData1,
      },
    ];
    
    const heatIndexChart2Data = [
      {
        id: `${systemAddress} 體感溫度`,
        data: heatIndexData2,
      },
    ];
    
    // 用電圖表（瞬間功率）
    const meterChart1Data = [
      {
        id: `${systemAddress} 瞬間功率`,
        data: meterPowerData1
      }
    ];
    
    const meterChart2Data = [
      {
        id: `${systemAddress} 瞬間功率`,
        data: meterPowerData2
      }
    ];
    
    const result: CompareResult = {
      chart1: chart1Data,
      chart2: chart2Data,
      humidityChart1: humidityChart1Data,
      humidityChart2: humidityChart2Data,
      heatIndexChart1: heatIndexChart1Data,
      heatIndexChart2: heatIndexChart2Data,
      meterChart1: meterChart1Data,
      meterChart2: meterChart2Data,
      avg1: parseFloat(avgTemp1.toFixed(1)),
      avg2: parseFloat(avgTemp2.toFixed(1)),
      avgHumidity1: parseFloat(avgHumidity1.toFixed(1)),
      avgHumidity2: parseFloat(avgHumidity2.toFixed(1)),
      avgHeatIndex1: parseFloat(avgHeatIndex1.toFixed(1)),
      avgHeatIndex2: parseFloat(avgHeatIndex2.toFixed(1)),
      savingPercent: parseFloat(savingPercent.toFixed(1)),
      wattRange1: parseFloat(totalConsumption1.toFixed(1)),
      wattRange2: parseFloat(totalConsumption2.toFixed(1)),
      vrfSensorDetails: vrfSensorDetails,
      meterData1Count: meterData1.length,
      meterData2Count: meterData2.length,
    };
    
    console.log('計算完成的結果:', result);
    yield put(actions.setCompareResult(result));
    
  } catch (error) {
    console.error('calculateCompareResult error:', error);
    yield put(actions.setCompareLoading(false));
  }
};

export const rootSaga = function* () {
  yield takeLatest(actions.fetchVrfData, VrfDataSaga);
  yield takeLatest(actions.fetchCompareData, CompareDataSaga);
};

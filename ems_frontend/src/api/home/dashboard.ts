import axios from "../../helper/axios";
import Cookies from "js-cookie";

// VRF 系統相關 API
export const getVrfSystems = async () => {
  try {
    const response = await axios({
      method: 'get',
      url: '/api/vrf',
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching VRF systems:', error);
    throw error;
  }
};

export const getVrfSensors = async (vrfId: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: `/api/vrf/${vrfId}/sensors`,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching sensors for VRF ${vrfId}:`, error);
    throw error;
  }
};

// 時間範圍查詢 API
export const getSensorReadingsByTimeRange = async (sensorId: string, startTime: string, endTime: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: `/api/sensors/${sensorId}/readings/time-range`,
      params: {
        start: startTime,
        end: endTime
      },
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    console.log(`Sensor ${sensorId} API response:`, response.data);
    return response.data.data.readings || [];
  } catch (error) {
    console.error(`Error fetching readings for sensor ${sensorId} in time range ${startTime} - ${endTime}:`, error);
    throw error;
  }
};

export const getMeterDataByTimeRange = async (meterId: string, startTime: string, endTime: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: `/api/meters/${meterId}/readings/time-range`,
      params: {
        start: startTime,
        end: endTime
      },
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    console.log(`Meter ${meterId} API response:`, response.data);
    return response.data.data.readings || [];
  } catch (error) {
    console.error(`Error fetching meter data for ${meterId} in time range ${startTime} - ${endTime}:`, error);
    throw error;
  }
};

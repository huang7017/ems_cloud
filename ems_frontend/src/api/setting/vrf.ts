import axios from "../../helper/axios";
import Cookies from "js-cookie";  
interface createVRFSystemRequest {
  address: string;
}

export const createVRFSystem = async (payload: createVRFSystemRequest) => {
  try {
    console.log('Sending request to create temperature sensor:', payload);
    
    // Try using the direct backend URL to avoid Next.js rewrites
    const response = await axios({
      method: 'post',
      url: '/api/vrf',
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    
    console.log('Response from create temperature API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating temperature sensor:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
    }
    throw error;
  } 
};

export const getVRFSystems = async () =>{
  try {
    const response = await axios({
      method: 'get',
      url: '/api/vrf',
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching temperature sensors:', error);
    throw error;
  }
};

export const deleteVRFSystem = async (id: string) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `/api/vrf/${id}`,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting temperature sensor:', error);
    throw error;
  }
};

export const createVrfAC = async (id: string) => {
  try {
    const response = await axios({
      method: 'post',
      url: `/api/vrf/${id}/ac_units`,
      data: {
      },
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching temperature sensor:', error);
    throw error;
  }
};

export const getVrfAC = async (id: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: `/api/vrf/${id}/sensors`,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching temperature sensor:', error);
    throw error;
  }
};

interface updateVrfACRequest {
  name: string,
  location: string,
  number: number,
  temperature_sensor_id: string,
}

export const updateVrfAC = async (id: string, payload: updateVrfACRequest) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `/api/vrf/ac_units/${id}`,
      data: payload,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating temperature sensor:', error);
    throw error;
  }
}

export const deleteVrfAC = async (id: string) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `/api/vrf/ac_units/${id}`,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting temperature sensor:', error);
    throw error;
  }
}
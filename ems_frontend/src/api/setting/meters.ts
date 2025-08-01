import axios from "../../helper/axios";
import Cookies from "js-cookie";
interface createMeterRequest {
  address: string;
}

export const createMeter = async (payload: createMeterRequest) => {
  try {
    console.log('Sending request to create temperature sensor:', payload);
    
    // Try using the direct backend URL to avoid Next.js rewrites
    const response = await axios({
      method: 'post',
      url: '/api/btc_ammeters',
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

export const getMeters = async () =>{
  try {
    const response = await axios({
      method: 'get',
      url: '/api/btc_ammeters',
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

export const deleteMeter = async (id: string) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `/api/btc_ammeters/${id}`,
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

import axios from "../../helper/axios";
import Cookies from "js-cookie";
interface createIoModuleRequest {
  channel: number,
  vrf: string
}

export const createIoModule = async (payload: createIoModuleRequest) => {
  try {
    console.log('Sending request to create io module:', payload);
    
    // Try using the direct backend URL to avoid Next.js rewrites
    const response = await axios({
      method: 'post',
      url: '/api/modules',
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    
    console.log('Response from create io module API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating io module:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Response:', error.response?.data);
      console.error('API Error Status:', error.response?.status);
    }
    throw error;
  } 
};

export const getIoModules = async (vrf: string) => {
  try {
    const response = await axios({
      method: 'get',
      url: `/api/modules/${vrf}`,
      headers: {
        "Authorization": `Bearer ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting io modules:', error);
  }
}


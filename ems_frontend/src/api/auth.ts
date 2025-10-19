import axios from "../helper/axios";
import type { AxiosError } from "../helper/axios";

interface LoginParams {
  account: string;
  password: string;
}

export const fetchAuthLoginData = async (payload: LoginParams) => {
  try {
    // console.log("Sending login request to:", "/auth/login");
    // console.log("Payload:", payload);

    const response = await axios.post("/auth/login", payload);

    // console.log("Full response:", response);
    // console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    // console.error("API Error:", error);
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
    }
    throw error;
  }
};

export const fetchAuthRefreshData = async () => {
  try {
    const response = await axios.post("/auth/refresh");
    return response.data;
  } catch (error) {
    throw error;
  }
};

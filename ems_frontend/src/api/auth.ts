import axios from "../helper/axios";

interface LoginParams {
  account: string;
  password: string;
}

export const fetchAuthLoginData = async (payload: LoginParams) => {
  try {
    const response = await axios.post("/api/auth/login", payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


// src/axiosConfig.ts

import axios, { type AxiosResponse } from "axios";


//使用ui库的message组件


axios.defaults.withCredentials = true;


// Response interceptor to handle errors and redirects
axios.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const code = error.response?.status;
    const url = error.config?.url;
    if (url === "/public/login") return error.response;
    if (code === 401) {
      setTimeout(() => {
        window.location.href = "/public";
      }, 1500);
    }

    return Promise.reject(error);
  }
);
export type { AxiosResponse };
export default axios;

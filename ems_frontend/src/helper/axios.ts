// src/axiosConfig.ts

import axios, { type AxiosResponse } from "axios";
import type { AxiosError } from "axios";
import { config } from "../config/environment";

// Set base URL for backend API
axios.defaults.baseURL = config.api.baseURL;
axios.defaults.timeout = config.api.timeout;

//使用ui库的message组件

axios.defaults.withCredentials = true;

// Request interceptor to add authorization header
axios.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get roleId from cookies and add X-RoleId header
    const roleId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("roleId="))
      ?.split("=")[1];

    if (roleId) {
      config.headers["X-Role-ID"] = roleId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and redirects
axios.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const code = error.response?.status;
    const url = error.config?.url;
    if (url === "/auth/login") return error.response;
    if (code === 401) {
      setTimeout(() => {
        window.location.href = "/public/login";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

export type { AxiosResponse, AxiosError };
export default axios;

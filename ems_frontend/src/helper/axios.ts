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

// Track if we're currently refreshing the token to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors and redirects
axios.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const code = error.response?.status;
    const url = originalRequest?.url;

    // Don't intercept login requests
    if (url === "/auth/login") {
      return error.response;
    }

    // Handle 401 errors
    if (code === 401) {
      // If it's the refresh endpoint that returned 401, logout immediately
      if (url === "/auth/refresh") {
        isRefreshing = false;
        processQueue(error);
        setTimeout(() => {
          window.location.href = "/public/login";
        }, 1500);
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry this request after token refresh completes
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Start refreshing
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post("/auth/refresh");
        
        // Token refreshed successfully
        isRefreshing = false;
        // Resume all queued requests
        processQueue();
        
        // Retry the original failed request with new token
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        isRefreshing = false;
        processQueue(refreshError);
        setTimeout(() => {
          window.location.href = "/public/login";
        }, 1500);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export type { AxiosResponse, AxiosError };
export default axios;

// Environment configuration
export const config = {
  // Backend API configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    timeout: 10000,
  },

  // App configuration
  app: {
    name: "EMS Cloud",
    version: "1.0.0",
  },
};

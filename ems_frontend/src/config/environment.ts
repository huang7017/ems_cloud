// Environment configuration
export const config = {
  // Backend API configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: 10000,
  },

  // App configuration
  app: {
    name: "EMS Cloud",
    version: "1.0.0",
  },
};

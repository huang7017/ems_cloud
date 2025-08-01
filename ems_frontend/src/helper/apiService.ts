// src/authService.ts

import { generateRandomString } from "./utils";
export const initializeCsrfToken = () => {
  const csrfToken = generateRandomString(32);
  return csrfToken;
};

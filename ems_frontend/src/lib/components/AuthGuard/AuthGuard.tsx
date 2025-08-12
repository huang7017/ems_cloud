import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticatedSelector } from "../../../features/Login/selector";
import Cookies from "js-cookie";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useSelector(isAuthenticatedSelector);
  const location = useLocation();

  // Check if user has valid token
  const hasValidToken = Cookies.get("accessToken");

  console.log(
    "AuthGuard: isAuthenticated:",
    isAuthenticated,
    "hasValidToken:",
    hasValidToken,
    "location:",
    location.pathname
  );

  // If not authenticated and no valid token, redirect to login
  if (!isAuthenticated && !hasValidToken) {
    // Only redirect if we're not already on the login page
    if (location.pathname !== "/public/login") {
      console.log(
        "AuthGuard: Redirecting to login (not authenticated, no token)"
      );
      return <Navigate to="/public/login" state={{ from: location }} replace />;
    }
  }

  // If authenticated but no token (edge case), redirect to login
  if (isAuthenticated && !hasValidToken) {
    // Only redirect if we're not already on the login page
    if (location.pathname !== "/public/login") {
      console.log(
        "AuthGuard: Redirecting to login (authenticated but no token)"
      );
      return <Navigate to="/public/login" state={{ from: location }} replace />;
    }
  }

  console.log("AuthGuard: Rendering children");
  return <>{children}</>;
};

export default AuthGuard;

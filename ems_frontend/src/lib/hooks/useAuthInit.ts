import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { actions } from "../../features/Login/reducer";
import { isAuthenticatedSelector } from "../../features/Login/selector";

export const useAuthInit = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(isAuthenticatedSelector);

  const initializeAuth = useCallback(() => {
    // Check if user is already authenticated via cookies
    const accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    const name = Cookies.get("name");
    const userId = Cookies.get("userId");

    if (accessToken && refreshToken && name && userId && !isAuthenticated) {
      // Reconstruct user data from cookies
      const userData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        member: {
          id: userId,
          name: decodeURIComponent(name),
        },
        member_roles: [], // You might want to store this in cookies too
        expires_in: 3600, // Default value
        token_type: "Bearer",
      };

      dispatch(actions.setUser(userData));
    } else if (!accessToken && isAuthenticated) {
      // If no token but still authenticated, clear the state
      dispatch(actions.logout());
    } else {
      console.log("useAuthInit: No action needed");
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return { isAuthenticated };
};

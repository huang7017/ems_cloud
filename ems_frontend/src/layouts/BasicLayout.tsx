/** 基础页面结构 - 有头部，有底部，有侧边导航 **/

import React, { useEffect, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../lib/components/Layout/Vertical/sidebar/Sidebar";
import Header from "../lib/components/Layout/Vertical//header/Header";
import { Box } from "@mui/material";
import { Main, Page } from "../lib/components/Layout/Wrapper";
import type { MenuitemsType } from "../lib/components/Layout/Vertical/sidebar/types";
import { getIcon } from "../lib/components/Icon/iconMapper";
import type { IState } from "../store/reducers";
import { useAuthInit } from "../lib/hooks/useAuthInit";
import { selectMenus, selectMenuLoading, fetchMenusStart } from "../features/Menu";

// ==================
// 路由组件
// ==================
const HomePage = React.lazy(() => import("../features/Home/index"));

const UserManagementPage = React.lazy(
  () => import("../features/Settings/UserManagement/index")
);

const PageManagementPage = React.lazy(
  () => import("../features/Settings/PageManagement/index")
);

// ==================
// 主组件
// ==================

const createSidebarStructure = (
  dbData: {
    id: number;
    parent: number;
    title: string;
    url: string;
    icon: string;
    sort?: number;
    is_enable?: boolean;
    is_show?: boolean;
  }[]
) => {
  console.log("createSidebarStructure - Input data:", dbData);
  
  const itemMap = new Map();

  // Filter out disabled or hidden menus
  const enabledMenus = dbData.filter(
    (item) => item.is_enable !== false && item.is_show !== false
  );

  console.log("createSidebarStructure - Enabled menus:", enabledMenus);

  // Sort menus by sort order if available
  const sortedMenus = enabledMenus.sort(
    (a, b) => (a.sort || 0) - (b.sort || 0)
  );

  // First pass: create all items and store them in the map
  sortedMenus.forEach((item) => {
    const sidebarItem = {
      id: item.id,
      parent: item.parent,
      title: item.title,
      href: item.url,
      icon: getIcon(item.icon),
      // Don't initialize children here
    };

    itemMap.set(item.id, sidebarItem);
  });

  // Second pass: establish parent-child relationships and concatenate URLs
  sortedMenus.forEach((item) => {
    if (item.parent) {
      const parent = itemMap.get(item.parent);
      const child = itemMap.get(item.id);
      if (parent && child) {
        // Append the child's URL to the parent's URL
        child.href = parent.href + child.href;
        // Initialize 'children' array if it doesn't exist
        parent.children = parent.children || [];
        parent.children.push(child);
      }
    }
  });

  // Filter out top-level items (those without a parent)
  const result = Array.from(itemMap.values()).filter((item) => !item.parent);
  
  console.log("createSidebarStructure - Final result:", result);
  
  return result;
};

const BasicLayout: React.FC = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state: IState) => state.customizer);
  const currentLanguage = customizer.isLanguage || "en";
  const menus = useSelector(selectMenus);
  const menuLoading = useSelector(selectMenuLoading);
  const { isAuthenticated } = useAuthInit();

  console.log("BasicLayout - menus:", menus, "menuLoading:", menuLoading, "isAuthenticated:", isAuthenticated);

  // Fetch menus after authentication is verified
  useEffect(() => {
    // Reset when menus are cleared (e.g., after logout)
    if (!isAuthenticated || menus.length > 0 || menuLoading) {
      return;
    }

    console.log("BasicLayout - Fetching menus...");
    dispatch(fetchMenusStart());
  }, [dispatch, isAuthenticated]);

  // Memoize the sidebar structure to prevent unnecessary re-renders
  const sideBar: MenuitemsType[] = useMemo(() => {
    // If menus are loaded from API, use them
    if (menus.length > 0) {
      try {
        return createSidebarStructure(menus);
      } catch (error) {
        console.error("Error creating sidebar structure:", error);
        return [];
      }
    }

    // While loading or if no menus yet, return empty array or minimal structure
    // This prevents showing default menu when API data should be used
    return [];
  }, [menus]);

  // Memoize the current language to prevent unnecessary re-renders
  const memoizedCurrentLanguage = useMemo(
    () => currentLanguage,
    [currentLanguage]
  );

  return (
    <Main>
      <Sidebar menuitems={sideBar} lng={memoizedCurrentLanguage} />
      <Page>
        <Header />
        <Box
          sx={{
            minHeight: "calc(100vh - 56px)",
            backgroundColor: "#f1f5f9",
            borderRadius: "0",
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/setting/user"
              element={<UserManagementPage lng={memoizedCurrentLanguage} />}
            />
            <Route
              path="/setting/menu"
              element={<PageManagementPage lng={memoizedCurrentLanguage} />}
            />
          </Routes>
        </Box>
      </Page>
    </Main>
  );
};

export default BasicLayout;

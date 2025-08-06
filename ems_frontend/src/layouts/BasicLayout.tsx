/** 基础页面结构 - 有头部，有底部，有侧边导航 **/

import React from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../lib/components/Layout/Vertical/sidebar/Sidebar";
import Header from "../lib/components/Layout/Vertical//header/Header";
import { Box } from "@mui/material";
import { Main, Page, Container } from "../lib/components/Layout/Wrapper";
import type { MenuitemsType } from "../lib/components/Layout/Vertical/sidebar/types";
import { getIcon } from "../lib/components/Icon/iconMapper";
import type { IState } from "../store/reducers";

// ==================
// 路由组件
// ==================
const HomePage = React.lazy(() => import("../features/Home/index"));

const UserManagementPage = React.lazy(
  () => import("../features/Settings/UserManagement/index")
);

// ==================
// 类型定义
// ==================
interface UserInfo {
  menu: {
    rows: any[];
  };
}

interface BasicLayoutProps {
  userinfo: UserInfo;
  onLogout: () => Promise<void>;
  switchRole: (key: string) => Promise<any>;
}

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
  }[]
) => {
  const itemMap = new Map();

  // First pass: create all items and store them in the map
  dbData.forEach((item) => {
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
  dbData.forEach((item) => {
    if (item.parent) {
      const parent = itemMap.get(item.parent);
      const child = itemMap.get(item.id);
      // Append the child's URL to the parent's URL
      child.href = parent.href + child.href;
      // Initialize 'children' array if it doesn't exist
      parent.children = parent.children || [];
      parent.children.push(child);
    }
  });

  // Filter out top-level items (those without a parent)
  return Array.from(itemMap.values()).filter((item) => !item.parent);
};
const BasicLayout: React.FC<BasicLayoutProps> = () => {
  const customizer = useSelector((state: IState) => state.customizer);
  const currentLanguage = customizer.isLanguage || "en";

  const sideBar: MenuitemsType[] = createSidebarStructure([
    {
      id: 1,
      parent: 0,
      title: "Home",
      url: "/",
      icon: "HomeIcon",
    },
    {
      id: 2,
      parent: 0,
      title: "Settings",
      url: "/settings",
      icon: "SettingsIcon",
    },
    {
      id: 3,
      parent: 2,
      title: "User Management",
      url: "/user-management",
      icon: "PeopleIcon",
    },
  ]);

  return (
    <Main>
      <Sidebar menuitems={sideBar} lng={currentLanguage} />
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
              path="/settings/user-management"
              element={<UserManagementPage lng={currentLanguage} />}
            />
          </Routes>
        </Box>
      </Page>
    </Main>
  );
};

export default BasicLayout;

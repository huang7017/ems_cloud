import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";
import type { Page, PageTreeItem } from "./types";

// Base selectors
export const pageManagementStateSelector = (state: RootState) =>
  state.pageManagement;

export const pagesSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.pages
);

export const loadingSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.loading
);

export const errorSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.error
);

export const searchTermSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.searchTerm
);

export const selectedPageSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.selectedPage
);

export const isDialogOpenSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.isDialogOpen
);

export const isDeleteDialogOpenSelector = createSelector(
  [pageManagementStateSelector],
  (pageManagement) => pageManagement.isDeleteDialogOpen
);

// Filtered pages
export const filteredPagesSelector = createSelector(
  [pagesSelector, searchTermSelector],
  (pages, searchTerm) => {
    if (!searchTerm) return pages;
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

// Tree structure
export const pagesTreeSelector = createSelector(
  [filteredPagesSelector],
  (pages): PageTreeItem[] => {
    const buildTree = (parentId: number, level: number): PageTreeItem[] => {
      return pages
        .filter((page) => page.parent === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((page) => ({
          ...page,
          children: buildTree(page.id, level + 1),
          level,
        }));
    };

    return buildTree(0, 0);
  }
);

// Flat list with indentation for display
export const pagesFlatListSelector = createSelector(
  [pagesTreeSelector],
  (tree): PageTreeItem[] => {
    const flatten = (items: PageTreeItem[]): PageTreeItem[] => {
      const result: PageTreeItem[] = [];
      items.forEach((item) => {
        result.push(item);
        if (item.children.length > 0) {
          result.push(...flatten(item.children));
        }
      });
      return result;
    };

    return flatten(tree);
  }
);

// Parent pages for dropdown
export const parentPagesSelector = createSelector([pagesSelector], (pages) => {
  const rootPages = pages.filter((page) => page.parent === 0);
  return [{ id: 0, title: "根目錄", url: "/", icon: "RootIcon" }, ...rootPages];
});

// Available icons
export const availableIconsSelector = createSelector([], () => [
  { value: "HomeIcon", label: "首頁" },
  { value: "SettingsIcon", label: "設定" },
  { value: "PeopleIcon", label: "用戶管理" },
  { value: "DashboardIcon", label: "儀表板" },
  { value: "AnalyticsIcon", label: "分析" },
  { value: "ReportIcon", label: "報表" },
  { value: "DeviceIcon", label: "設備" },
  { value: "NotificationIcon", label: "通知" },
  { value: "HelpIcon", label: "幫助" },
  { value: "InfoIcon", label: "資訊" },
]);

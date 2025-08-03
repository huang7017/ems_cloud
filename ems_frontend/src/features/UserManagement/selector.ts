import { createSelector } from "@reduxjs/toolkit";
import type { IState } from "../../store/reducers";
import type { User } from "./types";

// Base selectors
const userManagementState = (state: IState) => state.userManagement;

// User selectors
export const usersSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.users
);

export const filteredUsersSelector = createSelector(
  [usersSelector, userManagementState],
  (users, userManagement) => {
    if (!userManagement.searchTerm) return users;
    const searchTerm = userManagement.searchTerm.toLowerCase();
    return users.filter(
      (user: User) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
    );
  }
);

// Role selectors
export const rolesSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.roles
);

// UI selectors
export const loadingSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.loading
);

export const errorSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.error
);

export const activeTabSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.activeTab
);

export const searchTermSelector = createSelector(
  [userManagementState],
  (userManagement) => userManagement.searchTerm
);

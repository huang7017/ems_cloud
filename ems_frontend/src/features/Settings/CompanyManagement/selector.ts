import { createSelector } from "@reduxjs/toolkit";
import type { IState } from "../../../store/reducers";
import type { Company } from "./types";

export const selectCompanyManagement = (state: IState) =>
  state.companyManagement;

export const selectCompanies = createSelector(
  [selectCompanyManagement],
  (state) => state.companies
);

export const selectSelectedCompany = createSelector(
  [selectCompanyManagement],
  (state) => state.selectedCompany
);

export const selectCompanyTree = createSelector(
  [selectCompanyManagement],
  (state) => state.companyTree
);

export const selectCompanyMembers = createSelector(
  [selectCompanyManagement],
  (state) => state.companyMembers
);

export const selectCompanyDevices = createSelector(
  [selectCompanyManagement],
  (state) => state.companyDevices
);

export const selectLoading = createSelector(
  [selectCompanyManagement],
  (state) => state.loading
);

export const selectLoadingMembers = createSelector(
  [selectCompanyManagement],
  (state) => state.loadingMembers
);

export const selectLoadingDevices = createSelector(
  [selectCompanyManagement],
  (state) => state.loadingDevices
);

export const selectSnackbar = createSelector(
  [selectCompanyManagement],
  (state) => state.snackbar
);

export const selectError = createSelector(
  [selectCompanyManagement],
  (state) => state.error
);

// Build flat list of companies from hierarchy
export const selectFlatCompanies = createSelector(
  [selectCompanies],
  (companies): Company[] => {
    const flattenCompanies = (
      items: Company[],
      result: Company[] = []
    ): Company[] => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flattenCompanies(item.children, result);
        }
      });
      return result;
    };
    return flattenCompanies(companies);
  }
);

// Get available parent companies (for dropdown when creating/editing)
export const selectAvailableParentCompanies = createSelector(
  [selectFlatCompanies, selectSelectedCompany],
  (companies, selected): Company[] => {
    if (!selected) {
      return companies;
    }

    // Get all descendant IDs of selected company
    const getDescendantIds = (company: Company): Set<number> => {
      const ids = new Set<number>([company.id]);
      if (company.children) {
        company.children.forEach((child) => {
          const childIds = getDescendantIds(child);
          childIds.forEach((id) => ids.add(id));
        });
      }
      return ids;
    };

    const excludeIds = getDescendantIds(selected);

    // Exclude selected company and its descendants
    return companies.filter((c) => !excludeIds.has(c.id));
  }
);

// Get root companies (no parent)
export const selectRootCompanies = createSelector(
  [selectCompanies],
  (companies): Company[] => {
    return companies.filter((c) => !c.parent_id);
  }
);

// Get available devices (unassigned devices from API)
export const selectAvailableDevices = createSelector(
  [selectCompanyManagement],
  (state) => state.availableDevices
);

// Alias for selectAvailableDevices (API now returns only unassigned devices)
export const selectUnassignedDevices = selectAvailableDevices;

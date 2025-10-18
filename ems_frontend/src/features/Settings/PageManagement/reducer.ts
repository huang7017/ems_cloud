import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PageManagementState, Page } from "./types";

const initialState: PageManagementState = {
  pages: [],
  loading: false,
  error: null,
  searchTerm: "",
  selectedPage: null,
  isDialogOpen: false,
  isDeleteDialogOpen: false,
};

const pageManagementSlice = createSlice({
  name: "pageManagement",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Search
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    // Dialog states
    setDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDialogOpen = action.payload;
    },
    setDeleteDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteDialogOpen = action.payload;
    },
    setSelectedPage: (state, action: PayloadAction<Page | null>) => {
      state.selectedPage = action.payload;
    },

    // Page actions
    fetchPages: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSideBar: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPagesSuccess: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
      state.loading = false;
    },
    fetchPagesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    createPage: (state, _action: PayloadAction<Omit<Page, "id">>) => {
      state.loading = true;
      state.error = null;
    },
    createPageSuccess: (state, action: PayloadAction<Page>) => {
      state.pages.push(action.payload);
      state.loading = false;
    },
    createPageFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    updatePage: (state, _action: PayloadAction<Page>) => {
      state.loading = true;
      state.error = null;
    },
    updatePageSuccess: (state, action: PayloadAction<Page>) => {
      const index = state.pages.findIndex(
        (page) => page.id === action.payload.id
      );
      if (index !== -1) {
        state.pages[index] = action.payload;
      }
      state.loading = false;
    },
    updatePageFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    deletePage: (state, _action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deletePageSuccess: (state, action: PayloadAction<number>) => {
      state.pages = state.pages.filter((page) => page.id !== action.payload);
      state.loading = false;
    },
    deletePageFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Reorder pages
    reorderPages: (
      state,
      _action: PayloadAction<{ fromId: number; toId: number }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    reorderPagesSuccess: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
      state.loading = false;
    },
    reorderPagesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const actions = pageManagementSlice.actions;
export default pageManagementSlice.reducer;

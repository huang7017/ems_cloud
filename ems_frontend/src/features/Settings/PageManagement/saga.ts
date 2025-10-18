import { call, put, takeLatest } from "redux-saga/effects";
import { actions } from "./reducer";
import type { Page } from "./types";
import {
  fetchMenusApi,
  createMenuApi,
  updateMenuApi,
  deleteMenuApi,
  type MenuItem,
} from "../../../api/menu";

// Convert MenuItem to Page format
const menuItemToPage = (menuItem: MenuItem): Page => ({
  id: menuItem.id,
  parent: menuItem.parent,
  title: menuItem.title,
  url: menuItem.url,
  icon: menuItem.icon,
  sort: menuItem.sort,
  is_enable: menuItem.is_enable,
  is_show: menuItem.is_show,
});

// Convert Page to MenuItem format
const pageToMenuItem = (page: Omit<Page, "id">): Omit<MenuItem, "id"> => ({
  parent: page.parent,
  title: page.title,
  url: page.url,
  icon: page.icon,
  sort: page.sort,
  is_enable: page.is_enable,
  is_show: page.is_show,
});

function* sideBarSaga() {
  try {
    const response: { success: boolean; data: MenuItem[] } = yield call(
      fetchMenusApi
    );

    if (response.success) {
      const pages = response.data.map(menuItemToPage);
      yield put(actions.fetchPagesSuccess(pages));
    } else {
      yield put(actions.fetchPagesFailure("Failed to fetch pages"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while fetching pages";
    yield put(actions.fetchPagesFailure(errorMessage));
  }
}


// Fetch pages saga
function* fetchPagesSaga() {
  try {
    const response: { success: boolean; data: MenuItem[] } = yield call(
      fetchMenusApi
    );

    if (response.success) {
      const pages = response.data.map(menuItemToPage);
      yield put(actions.fetchPagesSuccess(pages));
    } else {
      yield put(actions.fetchPagesFailure("Failed to fetch pages"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while fetching pages";
    yield put(actions.fetchPagesFailure(errorMessage));
  }
}

// Create page saga
function* createPageSaga(action: ReturnType<typeof actions.createPage>) {
  try {
    const menuData = pageToMenuItem(action.payload);
    const response: { success: boolean; data: MenuItem[] } = yield call(
      createMenuApi,
      menuData
    );

    if (response.success && response.data.length > 0) {
      const newPage = menuItemToPage(response.data[0]);
      yield put(actions.createPageSuccess(newPage));
      yield put(actions.setDialogOpen(false));
    } else {
      yield put(actions.createPageFailure("Failed to create page"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while creating page";
    yield put(actions.createPageFailure(errorMessage));
  }
}

// Update page saga
function* updatePageSaga(action: ReturnType<typeof actions.updatePage>) {
  try {
    const { id, ...updateData } = action.payload;
    const response: { success: boolean; data: MenuItem[] } = yield call(
      updateMenuApi,
      id,
      updateData
    );

    if (response.success && response.data.length > 0) {
      const updatedPage = menuItemToPage(response.data[0]);
      yield put(actions.updatePageSuccess(updatedPage));
      yield put(actions.setDialogOpen(false));
    } else {
      yield put(actions.updatePageFailure("Failed to update page"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while updating page";
    yield put(actions.updatePageFailure(errorMessage));
  }
}

// Delete page saga
function* deletePageSaga(action: ReturnType<typeof actions.deletePage>) {
  try {
    const pageId = action.payload;
    const response: { success: boolean; data: MenuItem[] } = yield call(
      deleteMenuApi,
      pageId
    );

    if (response.success) {
      yield put(actions.deletePageSuccess(pageId));
      yield put(actions.setDeleteDialogOpen(false));
    } else {
      yield put(actions.deletePageFailure("Failed to delete page"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while deleting page";
    yield put(actions.deletePageFailure(errorMessage));
  }
}

// Reorder pages saga
function* reorderPagesSaga(action: ReturnType<typeof actions.reorderPages>) {
  try {
    const { fromId, toId } = action.payload;

    // First, fetch current pages to get the latest data
    const fetchResponse: { success: boolean; data: MenuItem[] } = yield call(
      fetchMenusApi
    );

    if (!fetchResponse.success) {
      yield put(
        actions.reorderPagesFailure(
          "Failed to fetch current pages for reordering"
        )
      );
      return;
    }

    const pages = fetchResponse.data.map(menuItemToPage);
    const fromIndex = pages.findIndex((p) => p.id === fromId);
    const toIndex = pages.findIndex((p) => p.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
      // Reorder the pages array
      const [movedPage] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, movedPage);

      // Update sort values and send updates to backend
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const newSort = i + 1;
        if (page.sort !== newSort) {
          yield call(updateMenuApi, page.id, { sort: newSort });
          page.sort = newSort;
        }
      }

      yield put(actions.reorderPagesSuccess(pages));
    } else {
      yield put(actions.reorderPagesFailure("Invalid page IDs for reordering"));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while reordering pages";
    yield put(actions.reorderPagesFailure(errorMessage));
  }
}

// Root saga
export function* pageManagementSaga() {
  yield takeLatest(actions.fetchPages.type, fetchPagesSaga);
  yield takeLatest(actions.fetchSideBar.type, sideBarSaga);
  yield takeLatest(actions.createPage.type, createPageSaga);
  yield takeLatest(actions.updatePage.type, updatePageSaga);
  yield takeLatest(actions.deletePage.type, deletePageSaga);
  yield takeLatest(actions.reorderPages.type, reorderPagesSaga);
}

import { call, put, takeLatest, delay } from "redux-saga/effects";
import { actions } from "./reducer";
import type { Page } from "./types";

// Fake data for pages
const fakePages: Page[] = [
  {
    id: 1,
    parent: 0,
    title: "首頁",
    url: "/",
    icon: "HomeIcon",
    order: 1,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 2,
    parent: 0,
    title: "設定",
    url: "/settings",
    icon: "SettingsIcon",
    order: 2,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 3,
    parent: 2,
    title: "用戶管理",
    url: "/settings/user-management",
    icon: "PeopleIcon",
    order: 1,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 4,
    parent: 2,
    title: "分頁管理",
    url: "/settings/page-management",
    icon: "PagesIcon",
    order: 2,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 5,
    parent: 0,
    title: "儀表板",
    url: "/dashboard",
    icon: "DashboardIcon",
    order: 3,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 6,
    parent: 0,
    title: "設備管理",
    url: "/devices",
    icon: "DeviceIcon",
    order: 4,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 7,
    parent: 6,
    title: "設備列表",
    url: "/devices/list",
    icon: "ListIcon",
    order: 1,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 8,
    parent: 6,
    title: "設備監控",
    url: "/devices/monitor",
    icon: "MonitorIcon",
    order: 2,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 9,
    parent: 6,
    title: "設備詳情",
    url: "/devices/info/:id",
    icon: "InfoIcon",
    order: 3,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
  {
    id: 10,
    parent: 6,
    title: "設備編輯",
    url: "/devices/edit/:id",
    icon: "EditIcon",
    order: 4,
    isActive: true,
    createdAt: "2023/05/01 10:00:00",
    updatedAt: "2023/05/01 10:00:00",
  },
];

// Simulate API delay
const simulateApiCall = () => delay(500);

// Fetch pages saga
function* fetchPagesSaga() {
  try {
    yield call(simulateApiCall);
    yield put(actions.fetchPagesSuccess(fakePages));
  } catch (error) {
    yield put(actions.fetchPagesFailure("Failed to fetch pages"));
  }
}

// Create page saga
function* createPageSaga(action: ReturnType<typeof actions.createPage>) {
  try {
    yield call(simulateApiCall);
    const newPage: Page = {
      ...action.payload,
      id: Math.max(...fakePages.map((p) => p.id)) + 1,
      createdAt: new Date().toLocaleString("zh-TW"),
      updatedAt: new Date().toLocaleString("zh-TW"),
      isActive: true,
    };
    fakePages.push(newPage);
    yield put(actions.createPageSuccess(newPage));
    yield put(actions.setDialogOpen(false));
  } catch (error) {
    yield put(actions.createPageFailure("Failed to create page"));
  }
}

// Update page saga
function* updatePageSaga(action: ReturnType<typeof actions.updatePage>) {
  try {
    yield call(simulateApiCall);
    const updatedPage: Page = {
      ...action.payload,
      updatedAt: new Date().toLocaleString("zh-TW"),
    };
    const index = fakePages.findIndex((p) => p.id === action.payload.id);
    if (index !== -1) {
      fakePages[index] = updatedPage;
    }
    yield put(actions.updatePageSuccess(updatedPage));
    yield put(actions.setDialogOpen(false));
  } catch (error) {
    yield put(actions.updatePageFailure("Failed to update page"));
  }
}

// Delete page saga
function* deletePageSaga(action: ReturnType<typeof actions.deletePage>) {
  try {
    yield call(simulateApiCall);
    const pageId = action.payload;
    const index = fakePages.findIndex((p) => p.id === pageId);
    if (index !== -1) {
      fakePages.splice(index, 1);
    }
    yield put(actions.deletePageSuccess(pageId));
    yield put(actions.setDeleteDialogOpen(false));
  } catch (error) {
    yield put(actions.deletePageFailure("Failed to delete page"));
  }
}

// Reorder pages saga
function* reorderPagesSaga(action: ReturnType<typeof actions.reorderPages>) {
  try {
    yield call(simulateApiCall);
    const { fromId, toId } = action.payload;

    // Simple reordering logic - in real implementation, this would be more complex
    const fromIndex = fakePages.findIndex((p) => p.id === fromId);
    const toIndex = fakePages.findIndex((p) => p.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedPage] = fakePages.splice(fromIndex, 1);
      fakePages.splice(toIndex, 0, movedPage);

      // Update order values
      fakePages.forEach((page, index) => {
        page.order = index + 1;
        page.updatedAt = new Date().toLocaleString("zh-TW");
      });
    }

    yield put(actions.reorderPagesSuccess([...fakePages]));
  } catch (error) {
    yield put(actions.reorderPagesFailure("Failed to reorder pages"));
  }
}

// Root saga
export function* pageManagementSaga() {
  yield takeLatest(actions.fetchPages.type, fetchPagesSaga);
  yield takeLatest(actions.createPage.type, createPageSaga);
  yield takeLatest(actions.updatePage.type, updatePageSaga);
  yield takeLatest(actions.deletePage.type, deletePageSaga);
  yield takeLatest(actions.reorderPages.type, reorderPagesSaga);
}

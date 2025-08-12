// src/store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import { rootSaga as authSaga } from "../features/Login/saga";
import { rootSaga as homeSaga } from "../features/Home/saga";
import { rootSaga as userManagementSaga } from "../features/Settings/UserManagement/saga";
import { pageManagementSaga } from "../features/Settings/PageManagement/saga";
import { menuSaga } from "../features/Menu/saga";
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});
sagaMiddleware.run(authSaga);
sagaMiddleware.run(homeSaga);
sagaMiddleware.run(userManagementSaga);
sagaMiddleware.run(pageManagementSaga);
sagaMiddleware.run(menuSaga);

export default store;

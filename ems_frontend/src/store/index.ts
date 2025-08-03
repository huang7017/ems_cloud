// src/store/index.ts

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootReducer from "./reducers";
import { rootSaga as authSaga } from "../features/Login/saga";
import { rootSaga as homeSaga } from "../features/Home/saga";
import { rootSaga as temperatureSaga } from "../features/Settings/Temperature/saga";
import { rootSaga as vrfSaga } from "../features/Settings/VRF/saga";
import { rootSaga as meterSaga } from "../features/Settings/Meters/saga";
import { rootSaga as userManagementSaga } from "../features/UserManagement/saga";
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(sagaMiddleware),
});
sagaMiddleware.run(authSaga);
sagaMiddleware.run(temperatureSaga);
sagaMiddleware.run(vrfSaga);
sagaMiddleware.run(meterSaga);
sagaMiddleware.run(homeSaga);
sagaMiddleware.run(userManagementSaga);

export default store;

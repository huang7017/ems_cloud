import { combineReducers } from "redux";

import { reducer as CustomizerReducer } from "./Customizer/reducer.tsx";
import { reducer as AuthReducer } from "../features/Login/reducer";
import { reducer as UtilReducer } from "../features/Util/reducer";
import { reducer as HomeReducer } from "../features/Home/reducer";
import { reducer as UserManagementReducer } from "../features/Settings/UserManagement/reducer";
import { default as PageManagementReducer } from "../features/Settings/PageManagement/reducer";
import { reducer as RoleManagementReducer } from "../features/Settings/RoleManagement/reducer";
import { reducer as PowerManagementReducer } from "../features/Settings/PowerManagement/reducer";
import { reducer as DeviceManagementReducer } from "../features/Settings/DeviceManagement/reducer";
import CompanyManagementReducer from "../features/Settings/CompanyManagement/reducer";
import ScheduleManagementReducer from "../features/Settings/ScheduleManagement/reducer";
import MenuReducer from "../features/Menu/reducer";

const rootReducer = combineReducers({
  auth: AuthReducer,
  util: UtilReducer,
  customizer: CustomizerReducer,
  home: HomeReducer,
  userManagement: UserManagementReducer,
  pageManagement: PageManagementReducer,
  roleManagement: RoleManagementReducer,
  powerManagement: PowerManagementReducer,
  deviceManagement: DeviceManagementReducer,
  companyManagement: CompanyManagementReducer,
  scheduleManagement: ScheduleManagementReducer,
  menu: MenuReducer,
});

export default rootReducer;

export type IState = ReturnType<typeof rootReducer>;

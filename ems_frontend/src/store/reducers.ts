import { combineReducers } from "redux";

import { reducer as CustomizerReducer } from "./Customizer/reducer.tsx";
import { reducer as AuthReducer } from "../features/Login/reducer";
import { reducer as UtilReducer } from "../features/Util/reducer";
import { reducer as HomeReducer } from "../features/Home/reducer";
import { reducer as UserManagementReducer } from "../features/Settings/UserManagement/reducer";
import { default as PageManagementReducer } from "../features/Settings/PageManagement/reducer";
import MenuReducer from "../features/Menu/reducer";

const rootReducer = combineReducers({
  auth: AuthReducer,
  util: UtilReducer,
  customizer: CustomizerReducer,
  home: HomeReducer,
  userManagement: UserManagementReducer,
  pageManagement: PageManagementReducer,
  menu: MenuReducer,
});

export default rootReducer;

export type IState = ReturnType<typeof rootReducer>;

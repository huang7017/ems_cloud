import { combineReducers } from "redux";

import { reducer as CustomizerReducer } from "./Customizer/reducer";
import { reducer as AuthReducer } from "../features/Login/reducer";
import { reducer as UtilReducer } from "../features/Util/reducer";
import { reducer as HomeReducer } from "../features/Home/reducer";
import { reducer as UserManagementReducer } from "../features/Settings/UserManagement/reducer";

const rootReducer = combineReducers({
  auth: AuthReducer,
  util: UtilReducer,
  customizer: CustomizerReducer,
  home: HomeReducer,
  userManagement: UserManagementReducer,
});

export default rootReducer;

export type IState = ReturnType<typeof rootReducer>;

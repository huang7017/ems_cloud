import { combineReducers } from "redux";

import { reducer as CustomizerReducer } from "./Customizer/reducer";
import { reducer as AuthReducer } from "../features/public/Login/reducer";
import { reducer as UtilReducer } from "../features/Util/reducer";
import { reducer as TemperatureReducer } from "../features/Settings/Temperature/reducer";
import { reducer as VRFReducer } from "../features/Settings/VRF/reducer";
import { reducer as MeterReducer } from "../features/Settings/Meters/reducer";
import { reducer as HomeReducer } from "../features/Home/reducer";

const rootReducer = combineReducers({
  auth: AuthReducer,
  util: UtilReducer,
  customizer: CustomizerReducer,
  temperature: TemperatureReducer,
  vrf: VRFReducer,
  meter: MeterReducer,
  home: HomeReducer,
});

export default rootReducer;

export type IState = ReturnType<typeof rootReducer>;

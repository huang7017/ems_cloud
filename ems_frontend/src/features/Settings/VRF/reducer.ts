import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { vrfSystem, vrfAC, ioModule, createVRFSystemRequest, updateVrfACRequest, createIoModuleRequest } from "./types";
export const initialState = {
  loading: false as boolean,
  vrfSystems: [] as vrfSystem[],
  error: null as string | null,
  vrfAC: [] as vrfAC[],
  vrfId: "" as string,
  ioModule: {} as ioModule,
};

const vrfSlice = createSlice({
  name: "vrf",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      // Reset error when starting a new operation
      if (action.payload === true) {
        state.error = null;
      }
    },
    createVRFSystem(_state, _action: PayloadAction<createVRFSystemRequest>) {},
    createVRFSystemSuccess(_state, _action: PayloadAction<vrfSystem>) {},
    createVRFSystemFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    getVRFSystems(state) {
      // This is just for triggering the saga
      state.error = null;
    },
    setVRFSystems(state, action: PayloadAction<vrfSystem[]>) {
      state.vrfSystems = action.payload;
    },
    deleteVRFSystem(_state, _action: PayloadAction<string>) {},
    createVrfAC(_state, _action: PayloadAction<string>) {},
    createVrfACSuccess(_state, _action: PayloadAction<vrfSystem>) {},
    createVrfACFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },

    getVrfAC(_state, _action: PayloadAction<string>) {},
    setVrfAC(state, action: PayloadAction<vrfAC[]>) {
      state.vrfAC = action.payload;
    },
    setVrfId(state, action: PayloadAction<string>) {
      state.vrfId = action.payload;
    },
    deleteVrfAC(_state, _action: PayloadAction<string>) {},
    deleteVrfACSuccess(state, action: PayloadAction<string>) {
      state.vrfAC = state.vrfAC.filter(ac => ac.id !== action.payload);
      state.error = null;
    },
    deleteVrfACFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    editVrfAC(_state, _action: PayloadAction<updateVrfACRequest>) {},
    editVrfACSuccess(state, action: PayloadAction<vrfAC>) {
      state.vrfAC = state.vrfAC.map(ac => 
        ac.id === action.payload.id ? action.payload : ac
      );
      state.error = null;
    },
    editVrfACFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },

    createIoModule(_state, _action: PayloadAction<createIoModuleRequest>) {},
    createIoModuleSuccess(_state, _action: PayloadAction<ioModule>) {},
    createIoModuleFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    getIoModule(_state, _action: PayloadAction<string>) {},
    setIoModule(state, action: PayloadAction<ioModule>) {
      state.ioModule = action.payload;
    },
  },
});

export const { actions, reducer } = vrfSlice;
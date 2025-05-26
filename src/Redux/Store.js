import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./feture/counterslice";
export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./authSlice";
import { taskApi } from "./taskSlice"; // Import the task API
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer, // Add taskApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, taskApi.middleware), // Add RTK Query middleware
});

setupListeners(store.dispatch);

export default store;

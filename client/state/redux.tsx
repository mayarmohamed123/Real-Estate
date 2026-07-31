"use client";

import { useState, useEffect } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector, Provider } from "react-redux";
import globalReducer from "./index";
import { api } from "./api";
import { setupListeners } from "@reduxjs/toolkit/query";

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(api.middleware),
  });
};

/* TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

/* REDUX HOOKS */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER WRAPPER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}

import { createSelector } from "@ngrx/store";
import { Iapp } from "../interfaces/app";
import { State } from "../reducers";

export const selectAppState = (state: State) => state.app;
 
export const getIsLoading = createSelector(
    selectAppState,
  (state: Iapp) => state.isLoading
);

export const getTheme = createSelector(
    selectAppState,
  (state: Iapp) => state.theme
);

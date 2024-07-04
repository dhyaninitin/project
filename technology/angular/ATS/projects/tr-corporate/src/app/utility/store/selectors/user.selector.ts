import { createSelector } from "@ngrx/store";
import { Iuser } from "../interfaces/user";
import { State } from "../reducers";

export const selectAppState = (state: State) => state.user;

export const getUserStatus = createSelector(
  selectAppState,
  (state: Iuser) => state.isLoggedIn
);

export const getUserDeatils = createSelector(
  selectAppState,
  (state: Iuser) => state
);

export const getUserFullName = createSelector(
  selectAppState,
  (state: Iuser) => state.fullName
);

export const getUserRole = createSelector(
  selectAppState,
  (state: Iuser) => state.role
);

export const getUserFirstName = createSelector(
  selectAppState,
  (state: Iuser) => state.name.firstName
);

export const getUserEmail = createSelector(
    selectAppState,
    (state: Iuser) => state.email
);

import { createSelector } from "@ngrx/store";
import { Iroles } from "../interfaces/role";
import { State } from "../reducers";

export const getRoleState = (state: State) => state.roles;

export const getRoles = createSelector(
    getRoleState,
    (state: Iroles) => state.list
);


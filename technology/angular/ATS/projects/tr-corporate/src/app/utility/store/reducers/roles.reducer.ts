import { Action, createReducer, on } from "@ngrx/store";
import * as RolesActions from "../actions/roles.action";
import { Iroles } from "../interfaces/role";

export const initialState: Iroles = {
    list: [],
};

export const rolesReducer = createReducer(
    initialState,

    on(RolesActions.setUserRoles, (state, action) => {
        return {
            ...state,
            list: action.data
        };
    }),
);

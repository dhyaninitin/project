import { createAction, props } from "@ngrx/store";
import { RolesActions } from "../action.constants";
import { Irole } from "../interfaces/role";

export const setUserRoles = createAction(
    RolesActions.USER_ROLES_ACTION,
    props<{ data: Irole[] }>()
);



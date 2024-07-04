import {
	ActionReducerMap,
	createSelector,
	MetaReducer,
} from "@ngrx/store";

import { environment } from '../../../../environments/environment';

// reducer
import * as userData from "../reducers/user.reducer";
import * as appData from "../reducers/app.reducer";
import * as accountData from "../reducers/account.reducer";
import * as roleData from "../reducers/roles.reducer";
import * as busVertdata from "./business-vertical.reducer";

// models
import { Iapp } from "../interfaces/app";
import { Iuser } from "../interfaces/user";
import { Iaccount } from "../interfaces/account";
import { Iroles } from "../interfaces/role";
import { IBusVertList } from "../interfaces/business-vertical";

export interface State {
	app: Iapp;
	user: Iuser;
	account: Iaccount,
	roles: Iroles,
	businessVerticles: IBusVertList
}

export const reducers: ActionReducerMap<State> = {
	user: userData.userReducer,
	app: appData.appReducer,
	account: accountData.accountReducer,
	roles: roleData.rolesReducer,
	businessVerticles: busVertdata.busVertReducer
};

export const metaReducers: MetaReducer<State>[] = !environment.production
	? []
	: [];


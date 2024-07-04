import { createAction, props } from "@ngrx/store";
import { AppActions } from "../action.constants";

export const setAppTheme = createAction(
	AppActions.APP_THEME_ACTION,
	props<{ data: string }>()
);

export const setAppLoader = createAction(
	AppActions.APP_LOADER_ACTION,
	props<{ data: boolean }>()
);


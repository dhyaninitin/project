import { Action, createReducer, on } from "@ngrx/store";
import * as AppActions from "../actions/app.action";
import { Iapp } from "../interfaces/app";

export const initialState: Iapp = {
	theme: '',
	isLoading: false
};

export const appReducer = createReducer(
	initialState,

	on(AppActions.setAppTheme, (state, action) => {
		return {
			...state,
			theme: action.data
		};
	}),

	on(AppActions.setAppLoader, (state, action) => {
		return {
			...state,
			isLoading: action.data
		};
	}),
);

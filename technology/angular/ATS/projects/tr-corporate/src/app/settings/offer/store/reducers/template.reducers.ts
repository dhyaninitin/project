import { Action, createReducer, on } from "@ngrx/store";
import * as Templateactions from "../actions/template.action";
import { TemplateInfo } from "../interface/template";

export const initialState: TemplateInfo = {
    offercomponentid: 'ta',
    fieldname: '',
    componenttype: '',
    hideifzero: null,
    ruleadded: null,
    selectedcomponent: '',
    mathfunction: '',
    operator: '',
    rule: '',
    offertemplateid: '',
    createdtime: null,
    modifiedtime: null
};

export const templateComponentReducer = createReducer(
	initialState,

	on(Templateactions.resetComponent, (state, action) => {
		return { ...initialState };
	}),

	on(Templateactions.setTemplateComponent, (state, action) => {
		return {
			...state,
			name: action.data
		};
	})
);

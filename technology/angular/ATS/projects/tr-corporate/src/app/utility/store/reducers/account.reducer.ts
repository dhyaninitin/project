import { Action, createReducer, on } from "@ngrx/store";
import * as AccountActions from "../actions/account.action";
import { Iaccount } from "../interfaces/account";

export const initialState: Iaccount = {
    accountList: [],
    details: {
        accounttype: '',
        cityid: '',
        cityname: '',
        countryid: '',
        countryname: '',
        domain: '',
        industryid: '',
        industryname: '',
        name: '',
        shortname: '',
        stateid: '',
        statename: '',
    }
};

export const accountReducer = createReducer(
    initialState,

    on(AccountActions.setAccountList, (state, action) => {
        return {
            ...state,
            accountList: action.data
        };
    }),

    on(AccountActions.resetAccount, (state, action) => {
        return { ...initialState };
    }),

    on(AccountActions.setAccountDeatils, (state, action) => {
        return {
            ...state,
            details: action.data
        };
    }),
);

import { createSelector } from "@ngrx/store";
import { Iaccount } from "../interfaces/account";
import { State } from "../reducers";

export const selectAppState = (state: State) => state.account;

export const getDefaultAccountId = createSelector(
    selectAppState,
    (state: Iaccount) => state.accountList.length ? state.accountList[0].accountid : ''
);

export const getAccountIds = createSelector(
    selectAppState,
    (state: Iaccount) => state.accountList
);

export const getAccountDeatils = createSelector(
    selectAppState,
    (state: Iaccount) => state.details
);

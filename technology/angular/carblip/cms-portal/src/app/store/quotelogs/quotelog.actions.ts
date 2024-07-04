import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { Quote, QuoteResponse, History } from 'app/shared/models/quote.model';

//#region Get List
export const GET_LIST = '@lc/quotes/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() { }
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/quotes/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: QuoteResponse) { }
}
//#endregion

//#region Get History List
export const GET_HISTORY_LIST = '@lc/quotes/get-history-list';
export class GetHistoryList implements Action {
  readonly type = GET_HISTORY_LIST;
  constructor() { }
}
//#endregion



export type Actions =
  | GetList
  | GetHistoryList
  | GetListSuccess


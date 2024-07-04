import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { WholesaleQuote, WholesaleQuoteResponse} from 'app/shared/models/wholesale-quote.model';

//#region Get List
export const GET_LIST = '@lc/wholesalequote/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() { }
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/wholesalequote/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: WholesaleQuoteResponse) { }
}
//#endregion

//#region Get History List
export const GET_HISTORY_LIST = '@lc/wholesalequote/get-history-list';
export class GetHistoryList implements Action {
  readonly type = GET_HISTORY_LIST;
  constructor() { }
}
//#endregion



export type Actions =
  | GetList
  | GetHistoryList
  | GetListSuccess


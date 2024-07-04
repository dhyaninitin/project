import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { Quote, QuoteResponse,History } from 'app/shared/models/quote.model';

//#region Get List
export const GET_LIST = '@lc/quotes/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/quotes/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: QuoteResponse) {}
}
//#endregion

//#region Get History List
export const GET_HISTORY_LIST = '@lc/quotes/get-history-list';
export class GetHistoryList implements Action {
  readonly type = GET_HISTORY_LIST;
  constructor() {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/quotes/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/quotes/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/quotes/delete';
export interface DeletePayload {
  id: string;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/quotes/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/quotes/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/quotes/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

export type Actions =
  | GetList
  | GetHistoryList
  | GetListSuccess
  | UpdateFilter
  | UpdateMeta
  | Delete
  | DeleteSuccess
  | AddError
  | ClearDetail;

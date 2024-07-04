import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { Dealer, DealerResponse } from 'app/shared/models/dealer.model';

//#region Get List
export const GET_LIST = '@lc/dealers/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/dealers/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: DealerResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/dealers/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/dealers/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/dealer/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: Dealer) {}
}

export const CREATE_SUCCESS = '@lc/dealer/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: Dealer) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/dealer/update';
export interface UpdatePayload {
  id: number;
  data: Object;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/dealer/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: Dealer) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/dealer/delete';
export interface DeletePayload {
  id: string;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/dealer/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/dealers/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/dealers/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

export type Actions =
  | GetList
  | GetListSuccess
  | UpdateFilter
  | UpdateMeta
  | Create
  | CreateSuccess
  | Update
  | UpdateSuccess
  | Delete
  | DeleteSuccess
  | AddError
  | ClearDetail;

import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';

import { Request, RequestResponse,RequestYears,UpdateRequest } from 'app/shared/models/request.model';

//#region Get List
export const GET_LIST = '@lc/requests/get-list';
export class GetList implements Action {

  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/requests/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: RequestResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/requests/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/requests/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/requests/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: object) {}
}

export const CREATE_SUCCESS = '@lc/object/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: Request) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/requests/update';
export interface UpdatePayload {
  id: number;
  data: UpdateRequest;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/requests/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: Request) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/requests/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/requests/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/requests/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/requests/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

//#Get Years List
export const GET_YEARS = '@lc/requests/get-years';
export class GetYears implements Action {
  readonly type = GET_YEARS;
  constructor(public payload: RequestYears) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_YEARS = '@lc/requests/get-list-years';

export class GetListYears implements Action {
  readonly type = GET_LIST_YEARS;
  constructor(public payload: RequestYears) {}
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
  | ClearDetail
  | GetYears
  | GetListYears;

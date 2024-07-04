import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { User, UserResponse } from 'app/shared/models/user.model';

//#region Get List
export const GET_LIST = '@lc/user/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/user/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: UserResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/user/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/user/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/user/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: User) {}
}

export const CREATE_SUCCESS = '@lc/user/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: User) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/user/update';
export interface UpdatePayload {
  id: number;
  data: User;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/user/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: User) {}
}
//#endregion

//#region Toggle
export const TOGGLE = '@lc/user/toggle';
export interface TogglePayload {
  id: number;
  data: Object;
}
export class Toggle implements Action {
  readonly type = TOGGLE;
  constructor(public payload: TogglePayload) {}
}

export const TOGGLE_SUCCESS = '@lc/user/toggle-success';

export class ToggleSuccess implements Action {
  readonly type = TOGGLE_SUCCESS;
  constructor(public payload: User) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/user/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/user/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/user/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/user/clear-detail';
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
  | Toggle
  | ToggleSuccess
  | Delete
  | DeleteSuccess
  | AddError
  | ClearDetail;

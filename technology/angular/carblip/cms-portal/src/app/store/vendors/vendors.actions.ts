import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { Vendors } from 'app/shared/models/vendors.model';

//#region Get List
export const GET_LIST = '@lc/vendors/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/vendors/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: Vendors) {}
}
//#endregion

// //#region Get History List
// export const GET_HISTORY_LIST = '@lc/quotes/get-history-list';
// export class GetHistoryList implements Action {
//   readonly type = GET_HISTORY_LIST;
//   constructor() {}
// }
// //#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/vendors/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/vendors/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/vendors/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: Vendors) {}
}

export const CREATE_SUCCESS = '@lc/vendors/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: Vendors) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/vendors/update';
export interface UpdatePayload {
  id: number;
  data: Vendors;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/vendors/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: Vendors) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/vendors/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {
  }
}

export const DELETE_SUCCESS = '@lc/vendors/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/vendors/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/vendors/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

export type Actions =
  | GetList
  // | GetHistoryList
  | GetListSuccess
  | UpdateFilter
  | UpdateMeta
  | Delete
  | Create
  | CreateSuccess
  | Update
  | UpdateSuccess
  | DeleteSuccess
  | AddError
  | ClearDetail;

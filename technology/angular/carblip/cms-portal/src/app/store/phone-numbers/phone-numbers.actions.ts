import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';

import { PhoneNumber, PhoneNumbersList, PhoneNumbersResponse } from 'app/shared/models/phone-numbers.model';

//#region Get List
export const GET_LIST = '@lc/phonenumberslist/get-list';
export class GetList implements Action {
    readonly type = GET_LIST;
    constructor() { }
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/phonenumberslist/get-list-success';

export class GetListSuccess implements Action {
    readonly type = GET_LIST_SUCCESS;
    constructor(public payload: PhoneNumbersResponse) { }
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/phonenumberslist/update-filter';

export class UpdateFilter implements Action {
    readonly type = UPDATE_FILTER;
    constructor(public payload: object) { }
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/phonenumberslist/update-meta';

export class UpdateMeta implements Action {
    readonly type = UPDATE_META;
    constructor(public payload: object) { }
}
//#endregion

//#region Update
export const UPDATE = '@lc/phonenumberslist/update';
export interface UpdatePayload {
  id: number;
  data: PhoneNumber;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/phonenumberslist/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: PhoneNumber) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/phonenumberslist/delete';
export interface DeletePayload {
    id: number;
    phone: string;
}
export class Delete implements Action {
    readonly type = DELETE;
    constructor(public payload: DeletePayload) { }
}

export const DELETE_SUCCESS = '@lc/phonenumberslist/delete-success';
export class DeleteSuccess implements Action {
    readonly type = DELETE_SUCCESS;
    constructor() { }
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/phonenumberslist/add-error';
export interface AddErrorPayload {
    error: string;
}
export class AddError implements Action {
    readonly type = ADD_ERROR;
    constructor(public payload: AddErrorPayload) { }
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/requests/clear-detail';
export class ClearDetail implements Action {
    readonly type = CLEAR_DETAIL;
    constructor() { }
}
//#endregion

export type Actions =
    | GetList
    | GetListSuccess
    | UpdateFilter
    | UpdateMeta
    | Update
    | Delete
    | DeleteSuccess
    | AddError
    | ClearDetail;

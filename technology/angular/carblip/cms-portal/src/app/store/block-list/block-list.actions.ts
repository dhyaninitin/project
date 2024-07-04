import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';

import { BlockList, BlockResponse } from 'app/shared/models/block-list.model';

//#region Get List
export const GET_LIST = '@lc/blocklist/get-list';
export class GetList implements Action {
    readonly type = GET_LIST;
    constructor() { }
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/blocklist/get-list-success';

export class GetListSuccess implements Action {
    readonly type = GET_LIST_SUCCESS;
    constructor(public payload: BlockResponse) { }
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/blocklist/update-filter';

export class UpdateFilter implements Action {
    readonly type = UPDATE_FILTER;
    constructor(public payload: object) { }
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/blocklist/update-meta';

export class UpdateMeta implements Action {
    readonly type = UPDATE_META;
    constructor(public payload: object) { }
}
//#endregion

//#region Delete
export const DELETE = '@lc/blocklist/delete';
export interface DeletePayload {
    id: Array<Number>;
}
export class Delete implements Action {
    readonly type = DELETE;
    constructor(public payload: DeletePayload) { }
}

export const DELETE_SUCCESS = '@lc/blocklist/delete-success';
export class DeleteSuccess implements Action {
    readonly type = DELETE_SUCCESS;
    constructor() { }
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/blocklist/add-error';
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
    | Delete
    | DeleteSuccess
    | AddError
    | ClearDetail;

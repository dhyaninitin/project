import { Action } from '@ngrx/store';

import {
  ClientFiles,
  ClientFilesResponse,
} from 'app/shared/models/client-files.model';
import * as commonModels from 'app/shared/models/common.model';

//#region Get List
export const GET_LIST = '@lc/clientfiles/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/clientfiles/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: ClientFilesResponse) {}
}
//#endregion

export const UPDATE_FILTER = '@lc/clientfiles/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/clientfiles/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

export const UPDATE_SUCCESS = '@lc/clientfiles/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: ClientFiles) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/clientfiles/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/clientfiles/clear-detail';
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
  | UpdateSuccess
  | AddError
  | ClearDetail;

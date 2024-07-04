import { Action } from '@ngrx/store';
import * as commonModels from 'app/shared/models/common.model';
import { LogResponse } from 'app/shared/models/log.model';


//#region Get List

export interface EnrollmentHistoryByIdPayload {
  id: number;
  filter: commonModels.Filter;
  newFilter:any;
}

export const GET_LIST = '@lc/enrollmentHistory/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: EnrollmentHistoryByIdPayload) {}
}
//#endregion


//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/enrollmentHistory/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: LogResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/enrollmentHistory/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/enrollmentHistory/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/enrollmentHistory/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/enrollmentHistory/clear-detail';
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
  | AddError
  | ClearDetail;

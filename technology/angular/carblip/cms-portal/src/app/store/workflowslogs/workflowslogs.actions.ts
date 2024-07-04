import { Action } from '@ngrx/store';
import * as commonModels from 'app/shared/models/common.model';
import { LogResponse } from 'app/shared/models/log.model';


//#region Get List
export const GET_LIST = '@lc/workflowslogs/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion


//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/workflowslogs/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: LogResponse) {}
}
//#endregion

//#region Get List By Id
export interface WorkflowLogsByIdPayload {
  id: number;
  filter: commonModels.Filter;
}

export const GET_LIST_BYID = '@lc/workflowslogs/get-list-byid';
export class GetListById implements Action {
  readonly type = GET_LIST_BYID;
  constructor(public payload: WorkflowLogsByIdPayload) {}
}
//#endregion


//#region Get List Success By Id
export const GET_LIST_BYID_SUCCESS = '@lc/workflowslogs/get-list-byid-success';

export class GetListByIdSuccess implements Action {
  readonly type = GET_LIST_BYID_SUCCESS;
  constructor(public payload: LogResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/workflowslogs/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/workflowslogs/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/workflowslogs/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/workflowslogs/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion



export type Actions =
  | GetList
  | GetListSuccess
  | GetListById
  | GetListByIdSuccess
  | UpdateFilter
  | UpdateMeta
  | AddError
  | ClearDetail;

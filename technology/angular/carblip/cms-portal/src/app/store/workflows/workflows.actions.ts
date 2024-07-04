import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { Workflow, WorkflowResponse } from 'app/shared/models/workflow.model';

//#region Get List
export const GET_LIST = '@lc/workflow/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/workflow/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: WorkflowResponse) {}
}

//#region Update Filter
export const UPDATE_FILTER = '@lc/workflow/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/workflow/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/workflow/update';
export interface UpdatePayload {
  id: number;
  data: Workflow;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/workflow/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: Workflow) {}
}
//#endregion

//#region Toggle
export const TOGGLE = '@lc/workflow/toggle';
export interface TogglePayload {
  data: Object;
}
export class Toggle implements Action {
  readonly type = TOGGLE;
  constructor(public payload: TogglePayload) {}
}

export const TOGGLE_SUCCESS = '@lc/workflow/toggle-success';

export class ToggleSuccess implements Action {
  readonly type = TOGGLE_SUCCESS;
  constructor(public payload: Workflow) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/workflow/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/workflow/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/workflow/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/workflow/clear-detail';
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
  | Update
  | UpdateSuccess
  | Toggle
  | ToggleSuccess
  | Delete
  | DeleteSuccess
  | AddError
  | ClearDetail;

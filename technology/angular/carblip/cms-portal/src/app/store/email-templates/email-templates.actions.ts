import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { EmailTemplate, WorkflowEmailTemplateResponse } from 'app/shared/models/email-templates.model';

//#region Get List
export const GET_LIST = '@lc/emailtemplate/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/emailtemplate/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: WorkflowEmailTemplateResponse) {}
}

//#region Update Filter
export const UPDATE_FILTER = '@lc/emailtemplate/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/emailtemplate/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/emailtemplate/update';
export interface UpdatePayload {
  id: number;
  data: EmailTemplate;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/emailtemplate/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: EmailTemplate) {}
}

//#region Toggle
export const TOGGLE = '@lc/emailtemplate/toggle';
export interface TogglePayload {
  id: number;
  data: Object;
}
export class Toggle implements Action {
  readonly type = TOGGLE;
  constructor(public payload: TogglePayload) {}
}

export const TOGGLE_SUCCESS = '@lc/emailtemplate/toggle-success';

export class ToggleSuccess implements Action {
  readonly type = TOGGLE_SUCCESS;
  constructor(public payload: EmailTemplate) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/emailtemplate/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/emailtemplate/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/emailtemplate/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/emailtemplate/clear-detail';
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
  | Delete
  | DeleteSuccess
  | AddError
  | Toggle
  | ToggleSuccess 
  | ClearDetail;

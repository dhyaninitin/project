import { Action } from '@ngrx/store';

import {
  PortalUser,
  PortalUserResponse,
  UpdatePortalUser,
} from 'app/shared/models/portaluser.model';
import * as commonModels from 'app/shared/models/common.model';

//#region Get List
export const GET_LIST = '@lc/portalusers/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/portalusers/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: PortalUserResponse) {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/portalusers/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/portalusers/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/portalusers/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: UpdatePortalUser) {}
}

export const CREATE_SUCCESS = '@lc/portalusers/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: PortalUser) {}
}
//#endregion

//#region Update
export const UPDATE = '@lc/portalusers/update';
export interface UpdatePayload {
  id: number;
  data: UpdatePortalUser;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/portalusers/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: PortalUser) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/portalusers/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/portalusers/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region UPDATE RR
export const UPDATERR = '@lc/portalusers/update-rr';
export interface UpdateRRPayload {
  id: number;
  status: Boolean;
}
export class UpdateRR implements Action {
  readonly type = UPDATERR;
  constructor(public payload: UpdateRRPayload) {}
}

export const UPDATERR_SUCCESS = '@lc/portalusers/update-rr-success';
export class UpdateRRSuccess implements Action {
  readonly type = UPDATERR_SUCCESS;
  constructor(public payload: PortalUser) {}
}
//#endregion

//#region Toggle
export const TOGGLE = '@lc/portalusers/toggle';
export interface TogglePayload {
  id: number;
  data: Object;
}
export class Toggle implements Action {
  readonly type = TOGGLE;
  constructor(public payload: TogglePayload) {}
}

export const TOGGLE_SUCCESS = '@lc/portalusers/toggle-success';

export class ToggleSuccess implements Action {
  readonly type = TOGGLE_SUCCESS;
  constructor(public payload: PortalUser) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/portalusers/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/portalusers/clear-detail';
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
  | Delete
  | DeleteSuccess
  | UpdateRR
  | UpdateRRSuccess
  | Toggle
  | ToggleSuccess
  | AddError
  | ClearDetail;

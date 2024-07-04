import { Action } from '@ngrx/store';

import * as commonModels from 'app/shared/models/common.model';
import { PortalDealStage, PortalDealStagePayload, PortalDealStageResponse } from 'app/shared/models/deal-stages.model';
import { DealStage, DealStageResponse } from 'app/shared/models/deal.model';

//#region Get List
export const GET_LIST = '@lc/dealstage/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/dealstage/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: DealStageResponse) {}
}
//#endregion

//#region Get List
export const GET_PORTAL_DEAL_STAGE_LIST = '@lc/dealstage/get-portal-deal-list';
export class GetPortalDealStageList implements Action {
  readonly type = GET_PORTAL_DEAL_STAGE_LIST;
  constructor(public payload: commonModels.Filter) {}
}
//#endregion

//#region Get List Success
export const GET_PORTAL_DEAL_STAGE_LIST_SUCCESS = '@lc/dealstage/get-portal-deal-list-success';

export class GetPortalDealStageListSuccess implements Action {
  readonly type = GET_PORTAL_DEAL_STAGE_LIST_SUCCESS;
  constructor(public payload: DealStageResponse) {}
}
//#endregion

//#region Create
export const CREATE = '@lc/dealstage/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: PortalDealStage) {}
}

export const CREATE_SUCCESS = '@lc/dealstage/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: PortalDealStage) {}
}
//#endregion


//#region Update
export const UPDATE = '@lc/dealstage/update';
export interface UpdatePayload {
  id: number;
  data: PortalDealStage;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) {}
}

export const UPDATE_SUCCESS = '@lc/dealstage/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: PortalDealStagePayload) {}
}
//#endregion

//#region Delete
export const DELETE = '@lc/dealstage/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) {}
}

export const DELETE_SUCCESS = '@lc/dealstage/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() {}
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/dealstage/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/dealstage/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/location/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/dealstage/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

export type Actions =
  | GetList
  | GetListSuccess
  | GetPortalDealStageList
  | GetPortalDealStageListSuccess
  | Create
  | CreateSuccess
  | Update
  | UpdateSuccess
  | Delete
  | DeleteSuccess
  | UpdateFilter
  | UpdateMeta
  | AddError
  | ClearDetail;

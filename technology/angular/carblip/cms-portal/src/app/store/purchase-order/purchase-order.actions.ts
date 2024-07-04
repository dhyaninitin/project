import { Action } from '@ngrx/store';
import { PurchaseOrder } from 'app/shared/models/purchase-order.model';

//#region Get List
export const GET_LIST = '@lc/purchase-order/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() { }
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/purchase-order/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: PurchaseOrder) { }
}
//#endregion

//#region Update Filter
export const UPDATE_FILTER = '@lc/purchase-order/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) { }
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/purchase-order/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) { }
}
//#endregion

//#region Create
export const CREATE = '@lc/purchase-order/create';

export class Create implements Action {
  readonly type = CREATE;
  constructor(public payload: PurchaseOrder) { }
}

export const CREATE_SUCCESS = '@lc/purchase-order/create-success';

export class CreateSuccess implements Action {
  readonly type = CREATE_SUCCESS;
  constructor(public payload: PurchaseOrder) { }
}
//#endregion

//#region Update
export const UPDATE = '@lc/purchase-order/update';
export interface UpdatePayload {
  id: number;
  data: PurchaseOrder;
}
export class Update implements Action {
  readonly type = UPDATE;
  constructor(public payload: UpdatePayload) { }
}

export const UPDATE_SUCCESS = '@lc/purchase-order/update-success';

export class UpdateSuccess implements Action {
  readonly type = UPDATE_SUCCESS;
  constructor(public payload: PurchaseOrder) { }
}
//#endregion

//#region Delete
export const DELETE = '@lc/purchase-order/delete';
export interface DeletePayload {
  id: number;
}
export class Delete implements Action {
  readonly type = DELETE;
  constructor(public payload: DeletePayload) { }
}

export const DELETE_SUCCESS = '@lc/purchase-order/delete-success';
export class DeleteSuccess implements Action {
  readonly type = DELETE_SUCCESS;
  constructor() { }
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/purchase-order/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) { }
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/purchase-order/clear-detail';
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
  | Create
  | CreateSuccess
  | Update
  | UpdateSuccess
  | DeleteSuccess
  | AddError
  | ClearDetail;

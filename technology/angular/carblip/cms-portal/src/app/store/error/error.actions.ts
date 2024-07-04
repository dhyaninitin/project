import { Action } from '@ngrx/store';
import { ErrorObj } from 'app/shared/models/common.model';

//#region Add Error
export const ADD_ERROR = '@lc/error/add-error';
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: ErrorObj) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/error/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

export type Actions = AddError | ClearDetail;

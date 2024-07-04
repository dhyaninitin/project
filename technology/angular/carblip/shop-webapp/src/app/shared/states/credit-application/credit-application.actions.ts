import { Action } from '@ngrx/store';

export const SET_CREDIT_APPLICATION_DATA = '[Credit Application]Set Data';
export class SetCreditApplicationData implements Action {
  readonly type = SET_CREDIT_APPLICATION_DATA;

  constructor(public payload: object) {}
}

export const CLEAR_CREDIT_APPLICATION_DATA = '[Credit Application]Clear Data';
export class ClearCreditApplicationData implements Action {
  readonly type = CLEAR_CREDIT_APPLICATION_DATA;

  constructor() {}
}

export type All = SetCreditApplicationData | ClearCreditApplicationData;

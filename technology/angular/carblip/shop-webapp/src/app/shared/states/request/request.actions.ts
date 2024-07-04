import { Action } from '@ngrx/store';

export const SET_REQUEST_DATA = '[Request]Set Data';
export class SetRequestData implements Action {
  readonly type = SET_REQUEST_DATA;

  constructor(public payload: { data: object }) {}
}

export const SET_CREDIT_SCORE = '[Request]Set Credit Score';
export class SetCreditScore implements Action {
  readonly type = SET_CREDIT_SCORE;

  constructor(public id: number) {}
}

export const CLEAR_REQUEST_DATA = '[Request]Clear Data';
export class ClearRequestData implements Action {
  readonly type = CLEAR_REQUEST_DATA;

  constructor() {}
}

export type All = SetRequestData | SetCreditScore | ClearRequestData;

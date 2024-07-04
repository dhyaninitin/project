import { Action } from '@ngrx/store';

import { IColorOptionGroup } from 'app/shared/states/configuration/configuration.interfaces';
import { IRequest } from 'app/shared/states/my-request/myrequests.interfaces';

export const FETCH_REQUEST_LIST = '[MYREQUEST]Fetch request details';
export interface FetchRequestListPayload {
  page: number;
  count: number;
}
export class FetchRequestList implements Action {
  readonly type = FETCH_REQUEST_LIST;

  constructor(public payload: FetchRequestListPayload) {}
}

export const FETCH_REQUEST_LIST_SUCCESS =
  '[MYREQUEST]Fetch request details success';
export class FetchRequestListSuccess implements Action {
  readonly type = FETCH_REQUEST_LIST_SUCCESS;

  constructor(public payload: { data: IRequest[] }) {}
}

export const FETCH_REQUEST_LIST_FAILED =
  '[MYREQUEST]Fetch request details failed';
export class FetchRequestListFailed implements Action {
  readonly type = FETCH_REQUEST_LIST_FAILED;

  constructor(public payload: { error: string }) {}
}

export const FETCH_REQUEST_COLOR = '[MYREQUEST]Fetch request color details';
export interface FetchRequestColorSuccessPayload {
  id: number;
  data: IColorOptionGroup;
}
export class FetchRequestColor implements Action {
  readonly type = FETCH_REQUEST_COLOR;

  constructor(public payload: FetchRequestColorSuccessPayload) {}
}

export const FETCH_REQUEST_COLOR_SUCCESS =
  '[MYREQUEST]Fetch request color details success';
export interface FetchRequestColorSuccessPayload {
  id: number;
  data: IColorOptionGroup;
}
export class FetchRequestColorSuccess implements Action {
  readonly type = FETCH_REQUEST_COLOR_SUCCESS;

  constructor(public payload: FetchRequestColorSuccessPayload) {}
}

export const FETCH_REQUEST_COLOR_FAILED =
  '[MYREQUEST]Fetch request color details failed';
export class FetchRequestColorFailed implements Action {
  readonly type = FETCH_REQUEST_COLOR_FAILED;

  constructor(public payload: { error: string }) {}
}

export const SELECT_MY_REQUEST = '[MYREQUEST]Select Request Item';
export class SelectMyRequest implements Action {
  readonly type = SELECT_MY_REQUEST;

  constructor(public id) {}
}

export const CLEAR_REQUEST_LIST = '[MYREQUEST]Clear request details';
export class ClearRequestList implements Action {
  readonly type = CLEAR_REQUEST_LIST;

  constructor() {}
}
// list every action class here
export type All =
  | FetchRequestList
  | FetchRequestListSuccess
  | FetchRequestListFailed
  | FetchRequestColorSuccess
  | FetchRequestColorFailed
  | SelectMyRequest
  | ClearRequestList;

import { Action } from '@ngrx/store';

import {
  IRequestFecthList,
  ITrim,
} from 'app/shared/states/trim/trim.interfaces';

/**
 * create one class per action and do not forget to add them at the end to the type All
 * this way, you'll be able to have type checking when dispatching and also in your reducers
 */
export const FETCH_TRIM_LIST = '[Trim]Fetch trim details';
export class FetchTrimList implements Action {
  readonly type = FETCH_TRIM_LIST;

  constructor(public requestParam: IRequestFecthList) {}
}

export const FETCH_TRIM_LIST_SUCCESS = '[TRIM]Fetch trim details success';
export class FetchTrimListSuccess implements Action {
  readonly type = FETCH_TRIM_LIST_SUCCESS;

  constructor(public payload: { data: ITrim[] }) {}
}

export const FETCH_TRIM_LIST_FAILED = '[TRIM]Fetch trim details failed';
export class FetchTrimListFailed implements Action {
  readonly type = FETCH_TRIM_LIST_FAILED;

  constructor(public payload: { error: string }) {}
}

export const SELECT_TRIM = '[TRIM]Select trim item';
export class SelectTrim implements Action {
  readonly type = SELECT_TRIM;

  constructor(public id) {}
}

export const CLEAR_TRIM_LIST = '[TRIM]Clear trim list';
export class ClearTrimList implements Action {
  readonly type = CLEAR_TRIM_LIST;

  constructor() {}
}

// list every action class here
export type All =
  | FetchTrimList
  | FetchTrimListSuccess
  | FetchTrimListFailed
  | SelectTrim
  | ClearTrimList;

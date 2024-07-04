import { Action } from '@ngrx/store';

import {
  IRequestFecthList,
  ISearchResponse,
} from 'app/shared/states/search/search.interfaces';

/**
 * create one class per action and do not forget to add them at the end to the type All
 * this way, you'll be able to have type checking when dispatching and also in your reducers
 */
export const UPDATE_KEYWORD = '[SEARCH]Update keyword';
export class UpdateKeyword implements Action {
  readonly type = UPDATE_KEYWORD;
  constructor(public payload: string) {}
}

export const FETCH_SEARCH_LIST = '[SEARCH]Fetch search details';
export class FetchSearchList implements Action {
  readonly type = FETCH_SEARCH_LIST;
  constructor(public requestParam: IRequestFecthList) {}
}

export const FETCH_SEARCH_LIST_SUCCESS = '[SEARCH]Fetch search details success';
export class FetchSearchListSuccess implements Action {
  readonly type = FETCH_SEARCH_LIST_SUCCESS;

  constructor(public payload: ISearchResponse) {}
}

export const FETCH_SEARCH_LIST_FAILED = '[SEARCH]Fetch search details failed';
export class FetchSearchListFailed implements Action {
  readonly type = FETCH_SEARCH_LIST_FAILED;

  constructor(public payload: { error: string }) {}
}

export const CLEAR_SEARCH_LIST = '[SEARCH]Clear search list';
export class ClearSearchList implements Action {
  readonly type = CLEAR_SEARCH_LIST;

  constructor() {}
}

// list every action class here
export type All =
  | UpdateKeyword
  | FetchSearchList
  | FetchSearchListSuccess
  | FetchSearchListFailed
  | ClearSearchList;

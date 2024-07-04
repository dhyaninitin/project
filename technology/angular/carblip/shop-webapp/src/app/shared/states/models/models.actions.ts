import { Action } from '@ngrx/store';

import {
  IModel,
  IRequestFecthList,
} from 'app/shared/states/models/models.interfaces';

/**
 * create one class per action and do not forget to add them at the end to the type All
 * this way, you'll be able to have type checking when dispatching and also in your reducers
 */
export const FETCH_MODEL_LIST = '[MODEL]Fetch model details';
export class FetchModelList implements Action {
  readonly type = FETCH_MODEL_LIST;

  constructor(public requestParam: IRequestFecthList) {}
}

export const FETCH_MODEL_LIST_SUCCESS = '[MODEL]Fetch model details success';
export class FetchModelListSuccess implements Action {
  readonly type = FETCH_MODEL_LIST_SUCCESS;

  constructor(public payload: { data: IModel[] }) {}
}

export const FETCH_MODEL_LIST_FAILED = '[MODEL]Fetch model details failed';
export class FetchModelListFailed implements Action {
  readonly type = FETCH_MODEL_LIST_FAILED;

  constructor(public payload: { error: string }) {}
}

export const SELECT_MODEL = '[MODEL]Select model item';
export class SelectModel implements Action {
  readonly type = SELECT_MODEL;

  constructor(public id) {}
}

export const UPDATE_YEAR = '[MODEL]Update year';
export class UpdateYear implements Action {
  readonly type = UPDATE_YEAR;

  constructor(public year) {}
}

export const CLEAR_MODEL_LIST = '[MODEL]Clear model list';
export class ClearModelList implements Action {
  readonly type = CLEAR_MODEL_LIST;

  constructor() {}
}

// list every action class here
export type All =
  | FetchModelList
  | FetchModelListSuccess
  | FetchModelListFailed
  | SelectModel
  | UpdateYear
  | ClearModelList;

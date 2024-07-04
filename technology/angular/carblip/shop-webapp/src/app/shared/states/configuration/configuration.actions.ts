import { Action } from '@ngrx/store';

import {
  IConfiguration,
  IRequestFecthData,
  IRequestFecthDataById,
  IRequestToggleOption,
} from 'app/shared/states/configuration/configuration.interfaces';

/**
 * create one class per action and do not forget to add them at the end to the type All
 * this way, you'll be able to have type checking when dispatching and also in your reducers
 */
export const FETCH_DEFALUT_CONFIGURATION =
  '[Configuration]Fetch default configuration details';
export class FetchDefaultConfigurationList implements Action {
  readonly type = FETCH_DEFALUT_CONFIGURATION;

  constructor(public payload: IRequestFecthData) {}
}

export const FETCH_DEFALUT_CONFIGURATION_SUCCESS =
  '[Configuration]Fetch default configuration details success';
export class FetchDefaultConfigurationListSuccess implements Action {
  readonly type = FETCH_DEFALUT_CONFIGURATION_SUCCESS;

  constructor(public payload: { data: IConfiguration }) {}
}

export const FETCH_DEFALUT_CONFIGURATION_FAILED =
  '[Configuration]Fetch default configuration details failed';
export class FetchDefaultConfigurationListFailed implements Action {
  readonly type = FETCH_DEFALUT_CONFIGURATION_FAILED;

  constructor(public payload: { error: string }) {}
}

export const FETCH_CONFIGURATION_BY_ID =
  '[Configuration]Fetch configuration details by id';
export class FetchConfigurationById implements Action {
  readonly type = FETCH_CONFIGURATION_BY_ID;

  constructor(public payload: IRequestFecthDataById) {}
}

export const FETCH_CONFIGURATION_BY_ID_SUCCESS =
  '[Configuration]Fetch configuration details by id success';
export class FetchConfigurationByIdSuccess implements Action {
  readonly type = FETCH_CONFIGURATION_BY_ID_SUCCESS;

  constructor(public payload: { data: IConfiguration }) {}
}

export const FETCH_CONFIGURATION_BY_ID_FAILED =
  '[Configuration]Fetch configuration details by id failed';
export class FetchConfigurationByIdFailed implements Action {
  readonly type = FETCH_CONFIGURATION_BY_ID_FAILED;

  constructor(public payload: { error: string }) {}
}

export const TOGGLE_OPTION = '[Configuration]Toggle Option';
export class ToggleOption implements Action {
  readonly type = TOGGLE_OPTION;
  constructor(public payload: IRequestToggleOption) {}
}

export const TOGGLE_OPTION_SUCCESS = '[Configuration]Toggle Option Success';
export class ToggleOptionSuccess implements Action {
  readonly type = TOGGLE_OPTION_SUCCESS;
  constructor(public payload: { data: IConfiguration }) {}
}

export const TOGGLE_OPTION_FAILED = '[Configuration]Toggle Option Failed';
export class ToggleOptionFailed implements Action {
  readonly type = TOGGLE_OPTION_FAILED;
  constructor(public payload: { error: string }) {}
}

export const CLEAR_DETAIL = '[Configuration]Clear Deatil';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;

  constructor() {}
}

// list every action class here
export type All =
  | FetchDefaultConfigurationList
  | FetchDefaultConfigurationListSuccess
  | FetchDefaultConfigurationListFailed
  | FetchConfigurationById
  | FetchConfigurationByIdSuccess
  | FetchConfigurationByIdFailed
  | ToggleOption
  | ToggleOptionSuccess
  | ToggleOptionFailed
  | ClearDetail;

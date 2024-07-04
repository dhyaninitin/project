import { Action } from '@ngrx/store';

import { IBrand } from 'app/shared/states/brands/brands.interfaces';

/**
 * create one class per action and do not forget to add them at the end to the type All
 * this way, you'll be able to have type checking when dispatching and also in your reducers
 */
export const FETCH_BRAND_LIST = '[BRAND]Fetch brand details';
export class FetchBrandList implements Action {
  readonly type = FETCH_BRAND_LIST;

  constructor() {}
}

export const FETCH_BRAND_LIST_SUCCESS = '[BRAND]Fetch brand details success';
export class FetchBrandListSuccess implements Action {
  readonly type = FETCH_BRAND_LIST_SUCCESS;

  constructor(public payload: { data: IBrand[] }) {}
}

export const FETCH_BRAND_LIST_FAILED = '[BRAND]Fetch brand details failed';
export class FetchBrandListFailed implements Action {
  readonly type = FETCH_BRAND_LIST_FAILED;

  constructor(public payload: { error: string }) {}
}

export const SELECT_BRAND = '[BRAND]Select Brand Item';
export class SelectBrand implements Action {
  readonly type = SELECT_BRAND;

  constructor(public id) {}
}

export const CLEAR_BRAND_LIST = '[BRAND]Clear brand list';
export class ClearBrandList implements Action {
  readonly type = CLEAR_BRAND_LIST;

  constructor() {}
}

export const CLEAR_BRAND_LIST_WITHOUT_SELECT =
  '[BRAND]Clear brand list without select';
export class ClearBrandListWithoutSelect implements Action {
  readonly type = CLEAR_BRAND_LIST_WITHOUT_SELECT;

  constructor() {}
}

// list every action class here
export type All =
  | FetchBrandList
  | FetchBrandListSuccess
  | FetchBrandListFailed
  | SelectBrand
  | ClearBrandList
  | ClearBrandListWithoutSelect;

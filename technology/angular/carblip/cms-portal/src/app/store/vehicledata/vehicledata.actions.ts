import { Action } from '@ngrx/store';
import * as commonModels from 'app/shared/models/common.model';
import { BrandFilter, BrandResponse, ModelFilter, ModelResponse, Response, TrimFilter, TrimResponse } from 'app/shared/models/vehicledata.model';

//#region Get List
export const GET_LIST = '@lc/vehiledata/get-list';
export class GetList implements Action {
  readonly type = GET_LIST;
  constructor() {}
}
//#endregion

//#region Get List Success
export const GET_LIST_SUCCESS = '@lc/vehiledata/get-list-success';

export class GetListSuccess implements Action {
  readonly type = GET_LIST_SUCCESS;
  constructor(public payload: Response) {}
}
//#endregion

//#region Update Year
export const UPDATE_YEAR = '@lc/vehiledata/update-year';
export interface UpdateYearPayload {
  id: number;
  is_active?: number;
  is_default?: number;
  is_scrapable?: number;
}
export class UpdateYear implements Action {
  readonly type = UPDATE_YEAR;
  constructor(public payload: UpdateYearPayload) {}
}

export const UPDATE_YEAR_SUCCESS = '@lc/vehiledata/update-year-success';

export class UpdateYearSuccess implements Action {
  readonly type = UPDATE_YEAR_SUCCESS;
  constructor(public payload: Response) {}
}
//#endregion year

//#region Update Filter
export const UPDATE_FILTER = '@lc/vehiledata/update-filter';

export class UpdateFilter implements Action {
  readonly type = UPDATE_FILTER;
  constructor(public payload: object) {}
}
//#endregion

//#region Update Meta
export const UPDATE_META = '@lc/vehiledata/update-meta';

export class UpdateMeta implements Action {
  readonly type = UPDATE_META;
  constructor(public payload: object) {}
}
//#endregion

//#region Add Error
export const ADD_ERROR = '@lc/vehiledata/add-error';
export interface AddErrorPayload {
  error: string;
}
export class AddError implements Action {
  readonly type = ADD_ERROR;
  constructor(public payload: AddErrorPayload) {}
}
//#endregion

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/vehiledata/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion


//#Get Brand List
export const GET_BRAND = '@lc/vehiledata/get-brand';
export class GetBrand implements Action {
  readonly type = GET_BRAND;
  constructor() {}
}
//#endregion


//#region Get Brand List Success
export const GET_LIST_BRAND = '@lc/vehiledata/get-list-brand';

export class GetListBrand implements Action {
  readonly type = GET_LIST_BRAND;
  constructor(public payload: BrandResponse) {}
}
//#endregion


//#region Update Brand
export const UPDATE_BRAND = '@lc/vehiledata/update-brand';
export interface UpdatebrandPayload {
  id: number;
  is_active: number;
  years:number;
}
export class UpdateBrand implements Action {
  readonly type = UPDATE_BRAND;
  constructor(public payload: UpdatebrandPayload) {}
}

export const UPDATE_BRAND_SUCCESS = '@lc/vehiledata/update-brand-success';

export class UpdateBrandSuccess implements Action {
  readonly type = UPDATE_BRAND_SUCCESS;
  constructor(public payload: BrandResponse) {}
}
//#endregion Brand



//#region Update Brand data
export const UPDATE_BRAND_DATA = '@lc/vehiledata/update-brand-data';
export interface UpdateBrandValuesPayload {
  id: number;
  file: File;
  file_extention:string;
  file_name:string;
}
export class UpdateBrandValues implements Action {
  readonly type = UPDATE_BRAND_DATA;
  constructor(public payload: UpdateBrandValuesPayload) {}
}

export const UPDATE_BRAND_DATA_SUCCESS = '@lc/vehiledata/update-brand-data-success';

export class UpdateBrandValuesSuccess implements Action {
  readonly type = UPDATE_BRAND_DATA_SUCCESS;
  constructor(public payload: BrandResponse) {}
}
//#endregion upadte brand data



//#Get Models List
export const GET_MODEL = '@lc/vehiledata/get-model';
export class GetModel implements Action {
  readonly type = GET_MODEL;
  constructor(public payload: ModelFilter) {}
}
//#endregion


//#region Get Models List Success
export const GET_LIST_MODEL = '@lc/vehiledata/get-list-model';

export class GetListModel implements Action {
  readonly type = GET_LIST_MODEL;
  constructor(public payload: ModelResponse) {}
}
//#endregion

//#region Get List Success
export const GET_LIST_MODEL_SUCCESS = '@lc/vehiledata/get-list-model-success';

export class GetListModelSuccess implements Action {
  readonly type = GET_LIST_MODEL_SUCCESS;
  constructor(public payload: ModelResponse) {}
}
//#endregion


//#region Update Model data
export const UPDATE_MODEL_DATA = '@lc/vehiledata/update-model-data';
export interface UpdateModelValuesPayload {
  id: number;
  file: File;
  file_extention:string;
  file_name:string;
}
export class UpdateModelValues implements Action {
  readonly type = UPDATE_MODEL_DATA;
  constructor(public payload: UpdateModelValuesPayload) {}
}

export const UPDATE_MODEL_DATA_SUCCESS = '@lc/vehiledata/update-model-data-success';

export class UpdateModelValuesSuccess implements Action {
  readonly type = UPDATE_MODEL_DATA_SUCCESS;
  constructor(public payload: ModelResponse) {}
}
//#endregion upadte brand data

//#region Clear Detail
export const CLEAR_MODEL_DETAIL = '@lc/vehiledata/clear-model-detail';
export class ClearModelDetail implements Action {
  readonly type = CLEAR_MODEL_DETAIL;
  constructor() {}
}
//#endregion



//#Get Trim List
export const GET_TRIM = '@lc/vehiledata/get-trim';
export class GetTrim implements Action {
  readonly type = GET_TRIM;
  constructor(public payload: TrimFilter) {}
}
//#endregion


//#region Get Trim List Success
export const GET_TRIM_LIST = '@lc/vehiledata/get-list-trim';

export class GetTrimList implements Action {
  readonly type = GET_TRIM_LIST;
  constructor(public payload: TrimResponse) {}
}
//#endregion

//#region Get List Success
export const GET_TRIM_LIST_SUCCESS = '@lc/vehiledata/get-trim-list-success';

export class GetTrimListSuccess implements Action {
  readonly type = GET_TRIM_LIST_SUCCESS;
  constructor(public payload: TrimResponse) {}
}
//#endregion


//#region Update Trim data
export const UPDATE_TRIM_DATA = '@lc/vehiledata/update-trim-data';
export interface UpdateTrimPayload {
  id: number;
  file: File;
  file_extention:string;
  file_name:string;
}
export class UpdateTrim implements Action {
  readonly type = UPDATE_TRIM_DATA;
  constructor(public payload: UpdateTrimPayload) {}
}

export const UPDATE_TRIM_DATA_SUCCESS = '@lc/vehiledata/update-trim-data-success';

export class UpdateTrimSuccess implements Action {
  readonly type = UPDATE_TRIM_DATA_SUCCESS;
  constructor(public payload: TrimResponse) {}
}

//#region Clear Detail
export const CLEAR_TRIM_DETAIL = '@lc/vehiledata/clear-trim-detail';
export class ClearTrimDetail implements Action {
  readonly type = CLEAR_TRIM_DETAIL;
  constructor() {}
}
//#endregion

//#endregion upadte Trim data


export type Actions =
  | GetList
  | GetListSuccess
  | UpdateFilter
  | UpdateMeta
  | AddError
  | ClearDetail
  | GetBrand
  | GetListBrand
  | UpdateYear
  | UpdateYearSuccess
  | UpdateBrand
  | UpdateBrandSuccess
  | GetModel
  | GetListModel
  | GetListModelSuccess
  | ClearModelDetail
  | UpdateBrandValues
  | UpdateBrandValuesSuccess
  | UpdateModelValues
  | UpdateModelValuesSuccess
  | GetTrim
  | GetTrimList
  | GetTrimListSuccess
  | UpdateTrim
  | UpdateTrimSuccess
  | ClearTrimDetail;


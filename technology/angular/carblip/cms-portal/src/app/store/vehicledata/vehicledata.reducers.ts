import { initialState, VehileDataState } from './vehicledata.states';
import { brandInitialState,BrandState } from './brand.states';

import { Year,BrandResponse, Response, ModelResponse, TrimResponse } from 'app/shared/models/vehicledata.model';
import * as actions from './vehicledata.actions';
import { modelInitialState, ModelState } from './model.states';
import { TrimState,trimInitialState } from './trim.states';


export function brandReducer(
  brandState: BrandState = brandInitialState,
  action: actions.Actions
): BrandState {
  
  switch (action.type) {
    case actions.GET_LIST_BRAND:
      return getListBrand(brandState, action.payload);
    case actions.GET_BRAND:
        return {
          ...brandState,
          didFetch: false,
          fetching: true,
          data: [],
        };

      /* Update brand start */
    case actions.UPDATE_BRAND:
        return {
          ...brandState,
        };

    case actions.UPDATE_BRAND_SUCCESS:
       return updateBrandSuccessful(brandState, action.payload);

    
    case actions.UPDATE_BRAND_DATA:
        return {
          ...brandState,
        };

    case actions.UPDATE_BRAND_DATA_SUCCESS:
       return updateBrandSuccessful(brandState, action.payload);
    /* Update brand End */

    default:
      return brandState;
  }
}

export function ModelReducer(
  modelState: ModelState = modelInitialState,
  action: actions.Actions
): ModelState {
  
  switch (action.type) {
    case actions.GET_LIST_MODEL:
      return getListModel(modelState, action.payload);
    case actions.GET_LIST_MODEL_SUCCESS:
      return getModelListSuccessful(modelState, action.payload);
    case actions.GET_MODEL:
        return {
          ...modelState,
          didFetch: false,
          fetching: true,
          data: [],
        };

      /* Update model start */
    case actions.UPDATE_MODEL_DATA:
        return {
          ...modelState,
        };

    case actions.UPDATE_MODEL_DATA_SUCCESS:
       return updateModelSuccessful(modelState, action.payload);
    /* Update model End */
    case actions.CLEAR_MODEL_DETAIL:
      return {
        ...modelInitialState,
      };

    default:
      return modelState;
  }
}


export function TrimReducer(
  trimState: TrimState = trimInitialState,
  action: actions.Actions
): TrimState {
  
  switch (action.type) {
    case actions.GET_TRIM_LIST:
      return getTrimList(trimState, action.payload);
    case actions.GET_TRIM_LIST_SUCCESS:
      return getTrimListSuccessful(trimState, action.payload);
    case actions.GET_TRIM:
        return {
          ...trimState,
          didFetch: false,
          fetching: true,
          data: [],
        };

      /* Update model start */
    case actions.UPDATE_TRIM_DATA:
        return {
          ...trimState,
        };

    case actions.UPDATE_TRIM_DATA_SUCCESS:
       return updateTrimSuccessful(trimState, action.payload);
    /* Update model End */
    case actions.CLEAR_TRIM_DETAIL:
      return {
        ...trimInitialState,
      };
    default:
      return trimState;
  }
}



export function vehicleDataReducer(
  state: VehileDataState = initialState,
  action: actions.Actions
): VehileDataState {
  switch (action.type) {
    /* Get List */
    case actions.GET_LIST:
      return {
        ...state,
        didFetch: false,
        fetching: true,
        data: [],
      };
    case actions.GET_LIST_SUCCESS:
      return getListSuccessful(state, action.payload);

    /* Update year start */
    case actions.UPDATE_YEAR:
      return {
        ...state,
      };

    case actions.UPDATE_YEAR_SUCCESS:
      return updateYearSuccessful(state, action.payload);
    /* Update year End */

    case actions.UPDATE_FILTER:
      return {
        ...state,
        didFetch: false,
        data: [],
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };
    case actions.UPDATE_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.payload,
        },
      };

    case actions.ADD_ERROR:
      return {
        ...state,
        fetching: false,
      };
    case actions.CLEAR_DETAIL:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}


function getListSuccessful(
  state: VehileDataState,
  result: Response
): VehileDataState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

function getListBrand(
  brandState: BrandState,
  result: BrandResponse
): BrandState {
  return {
    ...brandState,
    fetching: false,
    didFetch: true,
    data: result.data,
  };
}

function getListModel(
  modelState: ModelState,
  result: ModelResponse
): ModelState {
  return {
    ...modelState,
    fetching: false,
    didFetch: true,
    data: result.data,
  };
}

function getModelListSuccessful(
  state: ModelState,
  result: ModelResponse
): ModelState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}


function getTrimList(
  trimState: TrimState,
  result: TrimResponse
): TrimState {
  return {
    ...trimState,
    fetching: false,
    didFetch: true,
    data: result.data,
  };
}

function getTrimListSuccessful(
  state: TrimState,
  result: TrimResponse
): TrimState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}


function updateYearSuccessful(
  state: VehileDataState,
  result: any
): VehileDataState {
  const data = state.data.slice(0);
  const index = data.findIndex((item: any) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...state,
    data: data,
  };
}

function updateBrandSuccessful(
  brandState: BrandState,
  result: any
): BrandState {
  const data = brandState.data.slice(0);
  const index = data.findIndex((item: any) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...brandState,
    data: data,
  };
}


function updateModelSuccessful(
  modelState: ModelState,
  result: any
): ModelState {
  const data = modelState.data.slice(0);
  const index = data.findIndex((item: any) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...modelState,
    data: data,
  };
}

function updateTrimSuccessful(
  trimState: TrimState,
  result: any
): TrimState {
  const data = trimState.data.slice(0);
  const index = data.findIndex((item: any) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...trimState,
    data: data,
  };
}

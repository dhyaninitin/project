import { initialState, RequestsState } from './requests.states';
import { yearInitialState,YearsState } from './years.states';

import { Request, RequestResponse, RequestYears } from 'app/shared/models/request.model';
import * as actions from './requests.actions';

export function yearReducer(
  yearState: YearsState = yearInitialState,
  action: actions.Actions
): YearsState {
  
  switch (action.type) {
    case actions.GET_LIST_YEARS:
      return getListYears(yearState, action.payload);
    case actions.GET_YEARS:
        return {
          ...yearState,
          didFetch: false,
          fetching: true,
          data: [],
        };
    default:
      return yearState;
  }
}


export function requestsReducer(
  state: RequestsState = initialState,
  action: actions.Actions
): RequestsState {
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
    /* Create */
    case actions.CREATE:
      return {
        ...state,
        processing: true,
      };

    case actions.CREATE_SUCCESS:
      return {
        ...state,
        didFetch: false,
        processing: false,
        data: [],
      };

    /* Update */
    case actions.UPDATE:
      return {
        ...state,
        processing: true,
      };

    case actions.UPDATE_SUCCESS:
      return updateSuccessful(state, action.payload);

    /* Delete */
    case actions.DELETE:
      return {
        ...state,
        processing: true,
      };

    case actions.DELETE_SUCCESS:
      return {
        ...state,
        processing: false,
        didFetch: false,
        data: [],
      };

    case actions.ADD_ERROR:
      return {
        ...state,
        fetching: false,
        processing: false,
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
  state: RequestsState,
  result: RequestResponse
): RequestsState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

function getListYears(
  yearState: YearsState,
  result: RequestYears
): YearsState {
  return {
    ...yearState,
    fetching: false,
    didFetch: true,
    data: result.data,
  };
}

function updateSuccessful(
  state: RequestsState,
  result: Request
): RequestsState {
  const data = state.data.slice(0);
  const index = data.findIndex((item: Request) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...state,
    processing: false,
    data: data,
  };
}

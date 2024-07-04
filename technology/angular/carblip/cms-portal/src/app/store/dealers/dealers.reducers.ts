import { DealersState, initialState } from './dealers.states';

import { Dealer, DealerResponse } from 'app/shared/models/dealer.model';
import * as actions from './dealers.actions';

export function dealersReducer(
  state: DealersState = initialState,
  action: actions.Actions
): DealersState {
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
  state: DealersState,
  result: DealerResponse
): DealersState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

function updateSuccessful(state: DealersState, result: Dealer): DealersState {
  const data = state.data.slice(0);
  const index = data.findIndex((item: Dealer) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...state,
    processing: false,
    data: data,
  };
}

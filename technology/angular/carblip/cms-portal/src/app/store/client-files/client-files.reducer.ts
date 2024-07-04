import { ClientFilesState, initialState } from './client-files.states';

import { ClientFiles, ClientFilesResponse } from 'app/shared/models/client-files.model';
import * as actions from './client-files.actions';

export function clientFilesReducer(
  state: ClientFilesState = initialState,
  action: actions.Actions
): ClientFilesState {
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
  state: ClientFilesState,
  result: ClientFilesResponse
): ClientFilesState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}
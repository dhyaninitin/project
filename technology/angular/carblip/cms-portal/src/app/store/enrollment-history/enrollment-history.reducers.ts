import { initialState, enrollmentHistoryState } from "./enrollment-history.states";
import { LogResponse } from 'app/shared/models/log.model';
import * as actions from './enrollment-history.actions';

export function enrollmentHistoryReducer(
    state: enrollmentHistoryState = initialState,
    action: actions.Actions
): enrollmentHistoryState {
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
    state: enrollmentHistoryState,
    result: LogResponse
  ): enrollmentHistoryState {
    return {
      ...state,
      fetching: false,
      didFetch: true,
      data: result.data,
      meta: result.meta,
    };
  }
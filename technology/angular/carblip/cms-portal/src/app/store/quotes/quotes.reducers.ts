import { initialState, QuotesState } from './quotes.states';

import { Quote, QuoteResponse } from 'app/shared/models/quote.model';
import * as actions from './quotes.actions';

export function quotesReducer(
  state: QuotesState = initialState,
  action: actions.Actions
): QuotesState {
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
   /* Get History List */
   case actions.GET_HISTORY_LIST:
     return{
       ...state,
       didFetch:false,
       fetching:true,
       data:[]
     };
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
  state: QuotesState,
  result: QuoteResponse
): QuotesState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

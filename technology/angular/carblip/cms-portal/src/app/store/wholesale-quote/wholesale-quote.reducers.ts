import { initialState, WholesaleQuoteState } from './wholesale-quote.states';

import { WholesaleQuote, WholesaleQuoteResponse } from 'app/shared/models/wholesale-quote.model';
import * as actions from './wholesale-quote.actions';

export function wholesaleQuoteReducer(
  state: WholesaleQuoteState = initialState,
  action: actions.Actions
): WholesaleQuoteState {
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
  state: WholesaleQuoteState,
  result: WholesaleQuoteResponse
): WholesaleQuoteState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

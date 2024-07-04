import { initialState, WholesaleQuoteLogState } from './wholesale-quotelog.states';

import { WholesaleQuote, WholesaleQuoteResponse } from 'app/shared/models/wholesale-quote.model';
import * as actions from './wholesale-quotelog.actions';

export function wholesaleQuotelogReducer(
  state: WholesaleQuoteLogState = initialState,
  action: actions.Actions
): WholesaleQuoteLogState {
  switch (action.type) {
    /* Get List */
    case actions.GET_LIST:
      return {
        ...state,
        didFetch: false,
        fetching: true,
        data: [],
      };
    /* Get History List */
    case actions.GET_HISTORY_LIST:
      return {
        ...state,
        didFetch: false,
        fetching: true,
        data: []
      };

    default:
      return state;
  }
}

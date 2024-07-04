import { initialState, QuoteLogState } from './quotelog.states';

import { Quote, QuoteResponse } from 'app/shared/models/quote.model';
import * as actions from './quotelog.actions';

export function quotelogReducer(
  state: QuoteLogState = initialState,
  action: actions.Actions
): QuoteLogState {
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

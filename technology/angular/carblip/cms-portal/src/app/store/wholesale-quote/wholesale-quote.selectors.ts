import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WholesaleQuoteState } from './wholesale-quote.states';

export const name = 'wholesaleQuote';
export const wholesaleQuoteSelector = createFeatureSelector<WholesaleQuoteState>(name);

export const didFetchSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.didFetch
);

export const fetchingSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.fetching
);

export const processingSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.processing
);

export const dataSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.data
);

export const filterSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.filter
);

export const metaSelector = createSelector(
  wholesaleQuoteSelector,
  (state: WholesaleQuoteState) => state.meta
);

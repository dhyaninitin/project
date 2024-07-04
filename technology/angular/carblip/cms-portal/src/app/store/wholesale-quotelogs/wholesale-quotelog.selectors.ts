import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WholesaleQuoteLogState } from './wholesale-quotelog.states';

export const name = 'wholesaleQuotelog';
export const quotesSelector = createFeatureSelector<WholesaleQuoteLogState>(name);

export const didFetchSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.didFetch
);

export const fetchingSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.fetching
);

export const processingSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.processing
);

export const dataSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.data
);

export const filterSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.filter
);

export const metaSelector = createSelector(
  quotesSelector,
  (state: WholesaleQuoteLogState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuoteLogState } from './quotelog.states';

export const name = 'quotelog';
export const quotesSelector = createFeatureSelector<QuoteLogState>(name);

export const didFetchSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.didFetch
);

export const fetchingSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.fetching
);

export const processingSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.processing
);

export const dataSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.data
);

export const filterSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.filter
);

export const metaSelector = createSelector(
  quotesSelector,
  (state: QuoteLogState) => state.meta
);

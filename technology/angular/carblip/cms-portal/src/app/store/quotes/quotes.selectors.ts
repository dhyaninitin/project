import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuotesState } from './quotes.states';

export const name = 'quotes';
export const quotesSelector = createFeatureSelector<QuotesState>(name);

export const didFetchSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.didFetch
);

export const fetchingSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.fetching
);

export const processingSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.processing
);

export const dataSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.data
);

export const filterSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.filter
);

export const metaSelector = createSelector(
  quotesSelector,
  (state: QuotesState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VendorsState } from './vendors.states';

export const name = 'vendors';
export const quotesSelector = createFeatureSelector<VendorsState>(name);

export const didFetchSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.fetching
);

export const processingSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.processing
);

export const dataSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.data
);

export const filterSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.filter
);

export const metaSelector = createSelector(
  quotesSelector,
  (state: VendorsState) => state.meta
);

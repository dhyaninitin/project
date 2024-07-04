import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DealstageState } from './dealstage.states';

export const name = 'dealstage';
export const locationssSelector = createFeatureSelector<DealstageState>(name);

export const didFetchSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.didFetch
);

export const fetchingSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.fetching
);

export const processingSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.processing
);

export const dataSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.data
);

export const filterSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.filter
);

export const metaSelector = createSelector(
  locationssSelector,
  (state: DealstageState) => state.meta
);

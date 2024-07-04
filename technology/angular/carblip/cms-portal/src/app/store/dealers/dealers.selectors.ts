import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DealersState } from './dealers.states';

export const name = 'dealers';
export const DealersSelector = createFeatureSelector<DealersState>(name);

export const didFetchSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.didFetch
);

export const fetchingSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.fetching
);

export const processingSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.processing
);

export const dataSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.data
);

export const filterSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.filter
);

export const metaSelector = createSelector(
  DealersSelector,
  (state: DealersState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MDealersState } from './mdealers.states';

export const name = 'mdealers';
export const mDealersSelector = createFeatureSelector<MDealersState>(name);

export const didFetchSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.didFetch
);

export const fetchingSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.fetching
);

export const processingSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.processing
);

export const dataSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.data
);

export const filterSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.filter
);

export const metaSelector = createSelector(
  mDealersSelector,
  (state: MDealersState) => state.meta
);

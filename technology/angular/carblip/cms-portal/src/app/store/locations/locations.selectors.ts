import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LocationsState } from './locations.states';

export const name = 'locations';
export const locationssSelector = createFeatureSelector<LocationsState>(name);

export const didFetchSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.fetching
);

export const processingSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.processing
);

export const dataSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.data
);

export const filterSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.filter
);

export const metaSelector = createSelector(
  locationssSelector,
  (state: LocationsState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CarsDirectState } from './cars-direct.states';

export const name = 'carsDirect';
export const carsDirectSelector = createFeatureSelector<CarsDirectState>(name);

export const didFetchSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.didFetch
);

export const fetchingSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.fetching
);

export const processingSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.processing
);

export const dataSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.data
);

export const filterSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.filter
);

export const metaSelector = createSelector(
  carsDirectSelector,
  (state: CarsDirectState) => state.meta
);

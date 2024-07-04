import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RequestsState } from './requests.states';
import { YearsState } from './years.states';

export const name = 'requests';
export const yearname = 'years';
export const requestsSelector = createFeatureSelector<RequestsState>(name);
export const yearsSelector = createFeatureSelector<YearsState>(yearname);

export const didFetchSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.fetching
);

export const processingSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.processing
);

export const dataSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.data
);

export const filterSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.filter
);

export const metaSelector = createSelector(
  requestsSelector,
  (state: RequestsState) => state.meta
);

export const YearsDataSelector = createSelector(
  yearsSelector,
  (state: YearsState) => state.data
);

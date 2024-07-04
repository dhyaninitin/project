import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RequestLogsState } from './requestlogs.states';

export const name = 'requestlogs';
export const requestLogsSelector = createFeatureSelector<RequestLogsState>(
  name
);

export const didFetchSelector = createSelector(
  requestLogsSelector,
  (state: RequestLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  requestLogsSelector,
  (state: RequestLogsState) => state.fetching
);

export const dataSelector = createSelector(
  requestLogsSelector,
  (state: RequestLogsState) => state.data
);

export const filterSelector = createSelector(
  requestLogsSelector,
  (state: RequestLogsState) => state.filter
);

export const metaSelector = createSelector(
  requestLogsSelector,
  (state: RequestLogsState) => state.meta
);

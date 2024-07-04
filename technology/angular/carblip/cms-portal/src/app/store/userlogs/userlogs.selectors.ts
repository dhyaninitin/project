import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserLogsState } from './userlogs.states';

export const name = 'userlogs';
export const userLogsSelector = createFeatureSelector<UserLogsState>(
  name
);

export const didFetchSelector = createSelector(
  userLogsSelector,
  (state: UserLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  userLogsSelector,
  (state: UserLogsState) => state.fetching
);

export const dataSelector = createSelector(
  userLogsSelector,
  (state: UserLogsState) => state.data
);

export const filterSelector = createSelector(
  userLogsSelector,
  (state: UserLogsState) => state.filter
);

export const metaSelector = createSelector(
  userLogsSelector,
  (state: UserLogsState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UsersState } from './users.states';

export const name = 'users';
export const usersSelector = createFeatureSelector<UsersState>(name);

export const didFetchSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.didFetch
);

export const fetchingSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.fetching
);

export const processingSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.processing
);

export const dataSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.data
);

export const filterSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.filter
);

export const metaSelector = createSelector(
  usersSelector,
  (state: UsersState) => state.meta
);

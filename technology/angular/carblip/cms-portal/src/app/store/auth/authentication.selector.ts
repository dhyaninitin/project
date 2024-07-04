import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthenticationState } from './authentication.state';

export const name = 'authentication';
export const authenticationSelector = createFeatureSelector<
  AuthenticationState
>(name);

export const dataSelector = createSelector(
  authenticationSelector,
  (state: AuthenticationState) => state.data
);

export const didFetchSelector = createSelector(
  authenticationSelector,
  (state: AuthenticationState) => state.didFetch
);

export const fetchingSelector = createSelector(
  authenticationSelector,
  (state: AuthenticationState) => state.fetching
);

export const processingSelector = createSelector(
  authenticationSelector,
  (state: AuthenticationState) => state.processing
);

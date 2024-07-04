import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PortalUsersState } from './portalusers.states';

export const name = 'portalusers';
export const portalUsersSelector = createFeatureSelector<PortalUsersState>(name);

export const didFetchSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.didFetch
);

export const fetchingSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.fetching
);

export const processingSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.processing
);

export const dataSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.data
);

export const filterSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.filter
);

export const metaSelector = createSelector(
  portalUsersSelector,
  (state: PortalUsersState) => state.meta
);

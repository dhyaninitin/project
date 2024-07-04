import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WholesaleLogsState } from './wholesaleLogs.states';

export const name = 'wholesaleLogs';
export const wholesaleLogsSelector = createFeatureSelector<WholesaleLogsState>(
  name
);

export const didFetchSelector = createSelector(
  wholesaleLogsSelector,
  (state: WholesaleLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  wholesaleLogsSelector,
  (state: WholesaleLogsState) => state.fetching
);

export const dataSelector = createSelector(
  wholesaleLogsSelector,
  (state: WholesaleLogsState) => state.data
);

export const filterSelector = createSelector(
  wholesaleLogsSelector,
  (state: WholesaleLogsState) => state.filter
);

export const metaSelector = createSelector(
  wholesaleLogsSelector,
  (state: WholesaleLogsState) => state.meta
);

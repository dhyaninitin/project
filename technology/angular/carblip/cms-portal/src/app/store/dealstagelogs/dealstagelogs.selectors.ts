import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DealStageLogsState } from './dealstagelogs.states';

export const name = 'dealstagelogs';
export const portalUserogsSelector = createFeatureSelector<DealStageLogsState>(name);

export const didFetchSelector = createSelector(
  portalUserogsSelector,
  (state: DealStageLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  portalUserogsSelector,
  (state: DealStageLogsState) => state.fetching
);

export const dataSelector = createSelector(
  portalUserogsSelector,
  (state: DealStageLogsState) => state.data
);

export const filterSelector = createSelector(
  portalUserogsSelector,
  (state: DealStageLogsState) => state.filter
);

export const metaSelector = createSelector(
  portalUserogsSelector,
  (state: DealStageLogsState) => state.meta
);

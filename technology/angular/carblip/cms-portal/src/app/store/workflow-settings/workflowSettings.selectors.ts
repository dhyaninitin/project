import { createFeatureSelector, createSelector } from '@ngrx/store';
import { workflowSettingsState } from './workflowSettings.states';

export const name = 'workflowSettings';
export const workflowSettingsSelector = createFeatureSelector<workflowSettingsState>(
  name
);

export const didFetchSelector = createSelector(
  workflowSettingsSelector,
  (state: workflowSettingsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  workflowSettingsSelector,
  (state: workflowSettingsState) => state.fetching
);

export const dataSelector = createSelector(
  workflowSettingsSelector,
  (state: workflowSettingsState) => state.data
);

export const filterSelector = createSelector(
  workflowSettingsSelector,
  (state: workflowSettingsState) => state.filter
);

export const metaSelector = createSelector(
  workflowSettingsSelector,
  (state: workflowSettingsState) => state.meta
);

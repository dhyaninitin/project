import { createFeatureSelector, createSelector } from '@ngrx/store';
import { workflowState } from './workflows.states';

export const name = 'workflow';
export const workflowSelector = createFeatureSelector<workflowState>(name);

export const didFetchSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.didFetch
);

export const fetchingSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.fetching
);

export const processingSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.processing
);

export const dataSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.data
);

export const filterSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.filter
);

export const metaSelector = createSelector(
  workflowSelector,
  (state: workflowState) => state.meta
);

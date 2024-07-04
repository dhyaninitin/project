import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkflowLogsState } from './workflowslogs.states';

export const name = 'workflowslogs';
export const workflowLogsSelector = createFeatureSelector<WorkflowLogsState>(
    name
);

export const didFetchSelector = createSelector(
    workflowLogsSelector,
    (state: WorkflowLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
    workflowLogsSelector,
    (state: WorkflowLogsState) => state.fetching
);

export const dataSelector = createSelector(
    workflowLogsSelector,
    (state: WorkflowLogsState) => state.data
);

export const filterSelector = createSelector(
    workflowLogsSelector,
    (state: WorkflowLogsState) => state.filter
);

export const metaSelector = createSelector(
    workflowLogsSelector,
    (state: WorkflowLogsState) => state.meta
);
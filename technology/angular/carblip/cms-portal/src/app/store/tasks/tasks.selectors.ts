import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.states';

export const name = 'tasks';
export const tasksSelector = createFeatureSelector<TasksState>(name);

export const didFetchSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.didFetch
);

export const fetchingSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.fetching
);

export const processingSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.processing
);

export const dataSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.data
);

export const filterSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.filter
);

export const metaSelector = createSelector(
  tasksSelector,
  (state: TasksState) => state.meta
);

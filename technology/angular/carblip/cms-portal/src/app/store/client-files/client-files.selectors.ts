import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientFilesState } from './client-files.states';

export const name = 'clientfiles';
export const clientFilesSelector = createFeatureSelector<ClientFilesState>(name);

export const didFetchSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.didFetch
);

export const fetchingSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.fetching
);

export const processingSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.processing
);

export const dataSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.data
);

export const filterSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.filter
);

export const metaSelector = createSelector(
    clientFilesSelector,
  (state: ClientFilesState) => state.meta
);
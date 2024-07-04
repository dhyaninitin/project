import { createFeatureSelector, createSelector } from '@ngrx/store';
import { enrollmentHistoryState } from './enrollment-history.states';

export const name = 'enrollmentHistory';
export const enrollmentHistorySelector = createFeatureSelector<enrollmentHistoryState>(
    name
);

export const didFetchSelector = createSelector(
    enrollmentHistorySelector,
    (state: enrollmentHistoryState) => state.didFetch
);

export const fetchingSelector = createSelector(
    enrollmentHistorySelector,
    (state: enrollmentHistoryState) => state.fetching
);

export const dataSelector = createSelector(
    enrollmentHistorySelector,
    (state: enrollmentHistoryState) => state.data
);

export const filterSelector = createSelector(
    enrollmentHistorySelector,
    (state: enrollmentHistoryState) => state.filter
);

export const metaSelector = createSelector(
    enrollmentHistorySelector,
    (state: enrollmentHistoryState) => state.meta
);
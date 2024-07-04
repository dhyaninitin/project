import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ErrorState } from './error.states';

export const name = 'errors';
export const errorStateSelector = createFeatureSelector<ErrorState>(name);

export const errorSelector = createSelector(
  errorStateSelector,
  (state: ErrorState) => state.errors
);

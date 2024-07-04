import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ICreditApplicaiton } from './credit-application.interface';

export const creditApplicationState = createFeatureSelector<ICreditApplicaiton>(
  'creditApplication'
);

export const getState = createSelector(
  creditApplicationState,
  state => state
);

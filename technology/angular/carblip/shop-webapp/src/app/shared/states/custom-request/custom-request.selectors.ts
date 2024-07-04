import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ICustomRequest } from './custom-request.interface';

export const customRequestState = createFeatureSelector<ICustomRequest>(
  'customRequest'
);

export const getState = createSelector(
  customRequestState,
  state => state
);

export const getCredetScore = createSelector(
  customRequestState,
  state => state.credit_score
);

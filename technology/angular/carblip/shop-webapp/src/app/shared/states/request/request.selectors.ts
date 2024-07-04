import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IRequest } from './request.interface';

export const colorState = createFeatureSelector<IRequest>('request');

export const getState = createSelector(
  colorState,
  uiState => uiState
);

export const getCredetScore = createSelector(
  colorState,
  state => state.credit_score
);

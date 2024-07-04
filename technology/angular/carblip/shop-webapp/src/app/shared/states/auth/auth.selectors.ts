import { createFeatureSelector, createSelector } from '@ngrx/store';

import { IAuthGroup } from './auth.interfaces';

export const selectAuthState = createFeatureSelector<IAuthGroup>('auth');

export const getUserData = createSelector(
  selectAuthState,
  profileState => profileState.user
);

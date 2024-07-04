import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterStateUrl } from './router.state';
export { routerReducer } from '@ngrx/router-store';

export const name = 'router';
export const getRouterState = createFeatureSelector<RouterStateUrl>(name);

export const paramsIdSelector = createSelector(
  getRouterState,
  (state: any) => {
    if (state) {
      return state.state.params.id;
    } else {
      return null;
    }
  }
);

export const urlSelector = createSelector(
  getRouterState,
  (state: any) => {
    if (state) {
      return state.state.url;
    } else {
      return null;
    }
  }
);

import { createFeatureSelector, createSelector } from '@ngrx/store';

import { trimAdapter } from 'app/shared/states/trim/trim.reducer';

import { ITrimGroup } from 'app/shared/states/trim/trim.interfaces';

export const selectTrimState = createFeatureSelector<ITrimGroup>('trim');

export const {
  // select the array of trim ids
  selectIds: selectTrimIds,

  // select the dictionary of trim entities
  selectEntities: selectTrimEntities,

  // select the array of trim
  selectAll: selectAllTrim,

  // select the total trim count
  selectTotal: selectTrimTotal,
} = trimAdapter.getSelectors();

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization
export const selectCurrentTrimId = createSelector(
  selectTrimState,
  state => state.selected
);

export const selectCurrentTrim = createSelector(
  selectTrimState,
  selectCurrentTrimId,
  ({ entities }, trimId) => entities[trimId]
);

export const getTrimAsArray = createSelector(
  selectTrimState,
  state =>
    Object.keys(state.entities).map(function(key) {
      return state.entities[key];
    })
);

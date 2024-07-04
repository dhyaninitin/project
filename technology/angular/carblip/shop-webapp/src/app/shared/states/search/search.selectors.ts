import { createFeatureSelector, createSelector } from '@ngrx/store';

import { searchAdapter } from 'app/shared/states/search/search.reducer';

import { ISearchItemGroup } from 'app/shared/states/search/search.interfaces';

export const selectSearchState = createFeatureSelector<ISearchItemGroup>(
  'search'
);

export const {
  // select the array of search ids
  selectIds: selectSearchIds,

  // select the dictionary of search entities
  selectEntities: selectSearchEntities,

  // select the array of searchs
  selectAll: selectAllSearchs,

  // select the total search count
  selectTotal: selectSearchTotal,
} = searchAdapter.getSelectors();

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization

export const getKeyword = createSelector(
  selectSearchState,
  searchState => searchState.keyword
);

export const getSearchItemsAsArray = createSelector(
  selectSearchState,
  searchState =>
    Object.keys(searchState.entities).map(function(key) {
      return searchState.entities[key];
    })
);

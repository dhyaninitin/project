import { createFeatureSelector, createSelector } from '@ngrx/store';

import { brandsAdapter } from 'app/shared/states/brands/brands.reducer';

import { IBrandsGroup } from 'app/shared/states/brands/brands.interfaces';

export const selectBrandsState = createFeatureSelector<IBrandsGroup>('brand');

export const {
  // select the array of brand ids
  selectIds: selectBrandIds,

  // select the dictionary of brand entities
  selectEntities: selectBrandEntities,

  // select the array of brands
  selectAll: selectAllBrands,

  // select the total brand count
  selectTotal: selectBrandTotal,
} = brandsAdapter.getSelectors();

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization
export const selectCurrentBrandId = createSelector(
  selectBrandsState,
  brandState => brandState.selected
);

export const selectCurrentBrand = createSelector(
  selectBrandsState,
  selectCurrentBrandId,
  ({ entities }, brandId) => entities[brandId]
);

export const getBrandsAsArray = createSelector(
  selectBrandsState,
  brandState =>
    Object.keys(brandState.entities).map(function(key) {
      return brandState.entities[key];
    })
);

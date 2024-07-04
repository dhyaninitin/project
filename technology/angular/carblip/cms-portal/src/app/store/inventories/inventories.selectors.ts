import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InventoriesState } from './inventories.states';

export const name = 'inventories';
export const inventoriesSelector = createFeatureSelector<InventoriesState>(
  name
);

export const didFetchSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.didFetch
);

export const fetchingSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.fetching
);

export const processingSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.processing
);

export const dataSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.data
);

export const filterSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.filter
);

export const metaSelector = createSelector(
  inventoriesSelector,
  (state: InventoriesState) => state.meta
);

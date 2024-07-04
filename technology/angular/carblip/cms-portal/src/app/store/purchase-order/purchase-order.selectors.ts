import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PurchaseOrderState } from './purchase-order.states';

export const name = 'purchaseOrder';
export const quotesSelector = createFeatureSelector<PurchaseOrderState>(name);

export const didFetchSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.didFetch
);

export const fetchingSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.fetching
);

export const processingSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.processing
);

export const dataSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.data
);

export const filterSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.filter
);

export const metaSelector = createSelector(
  quotesSelector,
  (state: PurchaseOrderState) => state.meta
);

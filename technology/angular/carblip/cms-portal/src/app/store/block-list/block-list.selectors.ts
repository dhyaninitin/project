import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BlockListState } from '../block-list/block-list.states';

export const name = 'blockList';
export const blockListSelector = createFeatureSelector<BlockListState>(name);

export const didFetchSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.didFetch
);

export const fetchingSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.fetching
);

export const processingSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.processing
);

export const dataSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.data
);

export const filterSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.filter
);

export const metaSelector = createSelector(
    blockListSelector,
    (state: BlockListState) => state.meta
);

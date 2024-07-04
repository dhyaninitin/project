import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PhoneNumbersListState } from '../phone-numbers/phone-numbers.states';

export const name = 'phoneNumbers';
export const blockListSelector = createFeatureSelector<PhoneNumbersListState>(name);

export const didFetchSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.didFetch
);

export const fetchingSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.fetching
);

export const processingSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.processing
);

export const dataSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.data
);

export const filterSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.filter
);

export const metaSelector = createSelector(
    blockListSelector,
    (state: PhoneNumbersListState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { smsTemplateState } from './sms-templates.states';

export const name = 'smsTemplate';
export const smsTemplateSelector = createFeatureSelector<smsTemplateState>(name);

export const didFetchSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.didFetch
);

export const fetchingSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.fetching
);

export const processingSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.processing
);

export const dataSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.data
);

export const filterSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.filter
);

export const metaSelector = createSelector(
  smsTemplateSelector,
  (state: smsTemplateState) => state.meta
);

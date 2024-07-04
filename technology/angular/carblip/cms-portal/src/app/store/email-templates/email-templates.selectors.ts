import { createFeatureSelector, createSelector } from '@ngrx/store';
import { emailTemplateState } from './email-templates.states';

export const name = 'emailTemplate';
export const emailTemplateSelector = createFeatureSelector<emailTemplateState>(name);

export const didFetchSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.didFetch
);

export const fetchingSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.fetching
);

export const processingSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.processing
);

export const dataSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.data
);

export const filterSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.filter
);

export const metaSelector = createSelector(
  emailTemplateSelector,
  (state: emailTemplateState) => state.meta
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmailTemplateLogState } from './email-template-log.state';

export const name = 'emailtemplatelogs';
export const EmailTemplateLogSelector = createFeatureSelector<EmailTemplateLogState>(
  name
);

export const didFetchSelector = createSelector(
  EmailTemplateLogSelector,
  (state: EmailTemplateLogState) => state.didFetch
);

export const fetchingSelector = createSelector(
  EmailTemplateLogSelector,
  (state: EmailTemplateLogState) => state.fetching
);

export const dataSelector = createSelector(
  EmailTemplateLogSelector,
  (state: EmailTemplateLogState) => state.data
);

export const filterSelector = createSelector(
  EmailTemplateLogSelector,
  (state: EmailTemplateLogState) => state.filter
);

export const metaSelector = createSelector(
  EmailTemplateLogSelector,
  (state: EmailTemplateLogState) => state.meta
);

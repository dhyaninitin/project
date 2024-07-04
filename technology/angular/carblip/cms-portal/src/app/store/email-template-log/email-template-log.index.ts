import { emailTemplateLogReducer } from './email-template-log.reducers';
import { name } from './email-template-log.selectors';

export const store = {
  name,
  emailTemplateLogReducer: emailTemplateLogReducer,
  config: {},
};

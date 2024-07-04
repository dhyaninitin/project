import { emailTemplateReducer } from './email-templates.reducers';
import { name } from './email-templates.selectors';

export const store = {
  name,
  emailTemplateReducer: emailTemplateReducer,
  config: {},
};

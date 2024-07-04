import { smsTemplateReducer } from './sms-templates.reducers';
import { name } from './sms-templates.selectors';

export const store = {
  name,
  smsTemplateReducer: smsTemplateReducer,
  config: {},
};

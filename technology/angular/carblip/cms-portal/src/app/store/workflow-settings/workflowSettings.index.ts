import { workflowSettingsReducer } from './workflowSettings.reducers';
import { name } from './workflowSettings.selectors';

export const store = {
  name,
  workflowSettingsReducer: workflowSettingsReducer,
  config: {},
};

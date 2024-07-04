import { workflowReducer } from './workflows.reducers';
import { name } from './workflows.selectors';

export const store = {
  name,
  workflowReducer: workflowReducer,
  config: {},
};

import { workflowsLogsReducer } from './workflowslogs.reducers';
import { name } from './workflowslogs.selectors';

export const store = {
    name,
    workflowsLogsReducer: workflowsLogsReducer,
    config: {},
  };
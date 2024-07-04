import { requestLogsReducer } from './requestlogs.reducers';
import { name } from './requestlogs.selectors';

export const store = {
  name,
  requestLogsReducer: requestLogsReducer,
  config: {},
};

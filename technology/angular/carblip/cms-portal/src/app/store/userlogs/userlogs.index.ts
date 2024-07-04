import { userLogsReducer } from './userlogs.reducers';
import { name } from './userlogs.selectors';

export const store = {
  name,
  userLogsReducer: userLogsReducer,
  config: {},
};

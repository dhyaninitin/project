import { dealstageLogsReducer } from './dealstagelogs.reducers';
import { name } from './dealstagelogs.selectors';

export const store = {
  name,
  dealstageLogsReducer: dealstageLogsReducer,
  config: {},
};

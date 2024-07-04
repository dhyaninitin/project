import { wholesaleLogsReducer } from './wholesaleLogs.reducers';
import { name } from './wholesaleLogs.selectors';

export const store = {
  name,
  wholesaleLogsReducer: wholesaleLogsReducer,
  config: {},
};

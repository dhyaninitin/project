import { vehicleDataLogsReducer } from './vehicledatalogs.reducers';
import { name } from './vehicledatalogs.selectors';

export const store = {
  name,
  vehicleDataLogsReducer: vehicleDataLogsReducer,
  config: {},
};

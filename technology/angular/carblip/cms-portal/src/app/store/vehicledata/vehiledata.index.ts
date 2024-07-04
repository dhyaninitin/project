import { vehicleDataReducer } from './vehicledata.reducers';
import { name } from './vehicledata.selectors';

export const store = {
  name,
  vehicleDataReducer: vehicleDataReducer,
  config: {},
};

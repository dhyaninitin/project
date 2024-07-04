import { vendorsReducer } from './vendors.reducers';
import { name } from './vendors.selectors';

export const store = {
  name,
  vendorsReducer: vendorsReducer,
  config: {},
};

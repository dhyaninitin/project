import { locationsReducer } from './locations.reducers';
import { name } from './locations.selectors';

export const store = {
  name,
  locationsReducer: locationsReducer,
  config: {},
};

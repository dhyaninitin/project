import { dealstageReducer } from './dealstage.reducers';
import { name } from './dealstage.selectors';

export const store = {
  name,
  dealstageReducer: dealstageReducer,
  config: {},
};

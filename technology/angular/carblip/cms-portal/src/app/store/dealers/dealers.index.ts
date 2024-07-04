import { dealersReducer } from './dealers.reducers';
import { name } from './dealers.selectors';

export const store = {
  name,
  dealersReducer: dealersReducer,
  config: {},
};

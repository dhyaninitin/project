import { mDealersReducer } from './mdealers.reducers';
import { name } from './mdealers.selectors';

export const store = {
  name,
  mDealersReducer: mDealersReducer,
  config: {},
};

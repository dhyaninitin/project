import { quotesReducer } from './quotes.reducers';
import { name } from './quotes.selectors';

export const store = {
  name,
  quotesReducer: quotesReducer,
  config: {},
};

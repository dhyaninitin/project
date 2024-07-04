import { wholesaleQuoteReducer } from './wholesale-quote.reducers';
import { name } from './wholesale-quote.selectors';

export const store = {
  name,
  wholesaleQuoteReducer: wholesaleQuoteReducer,
  config: {},
};

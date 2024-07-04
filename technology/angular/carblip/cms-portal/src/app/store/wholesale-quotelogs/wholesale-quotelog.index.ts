import { wholesaleQuotelogReducer } from './wholesale-quotelog.reducers';
import { name } from './wholesale-quotelog.selectors';

export const store = {
  name,
  wholesaleQuotelogReducer: wholesaleQuotelogReducer,
  config: {},
};

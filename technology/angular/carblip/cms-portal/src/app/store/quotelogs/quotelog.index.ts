import { quotelogReducer } from './quotelog.reducers';
import { name } from './quotelog.selectors';

export const store = {
  name,
  quotelogReducer: quotelogReducer,
  config: {},
};

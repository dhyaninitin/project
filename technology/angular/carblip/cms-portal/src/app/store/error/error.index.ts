import { errorReducer } from './error.reducers';
import { name } from './error.selectors';

export const store = {
  name,
  errorReducer: errorReducer,
  config: {},
};

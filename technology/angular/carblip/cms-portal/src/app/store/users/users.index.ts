import { usersReducer } from './users.reducers';
import { name } from './users.selectors';

export const store = {
  name,
  usersReducer: usersReducer,
  config: {},
};

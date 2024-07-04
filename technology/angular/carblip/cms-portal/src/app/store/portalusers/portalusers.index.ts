import { portalUsersReducer } from './portalusers.reducers';
import { name } from './portalusers.selectors';

export const store = {
  name,
  portalUsersReducer: portalUsersReducer,
  config: {},
};

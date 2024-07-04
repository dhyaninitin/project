import { clientFilesReducer } from './client-files.reducer';
import { name } from './client-files.selectors';

export const store = {
  name,
  portalUsersReducer: clientFilesReducer,
  config: {},
};

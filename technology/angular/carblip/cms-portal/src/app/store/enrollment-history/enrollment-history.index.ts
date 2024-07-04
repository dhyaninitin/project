import { enrollmentHistoryReducer } from './enrollment-history.reducers';
import { name } from './enrollment-history.selectors';

export const store = {
    name,
    enrollmentHistoryReducer: enrollmentHistoryReducer,
    config: {},
  };
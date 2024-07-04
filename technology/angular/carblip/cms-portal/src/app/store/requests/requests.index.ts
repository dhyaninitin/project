import { requestsReducer } from './requests.reducers';
import { name } from './requests.selectors';

export const store = {
  name,
  requestsReducer: requestsReducer,
  config: {},
};

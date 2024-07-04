import { tasksReducer } from './tasks.reducers';
import { name } from './tasks.selectors';

export const store = {
  name,
  tasksReducer: tasksReducer,
  config: {},
};

import { inventoriesReducer } from './inventories.reducers';
import { name } from './inventories.selectors';

export const store = {
  name,
  inventoriesReducer: inventoriesReducer,
  config: {},
};

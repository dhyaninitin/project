import { purchaseOrderReducer } from './purchase-order.reducers';
import { name } from './purchase-order.selectors';

export const store = {
  name,
  purchaseOrderReducer: purchaseOrderReducer,
  config: {},
};

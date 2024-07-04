import * as commonModels from 'app/shared/models/common.model';
import * as dealerModels from 'app/shared/models/mdealer.model';

export interface MDealersState {
  fetching: boolean;
  didFetch: boolean;
  processing: boolean;
  data: Array<dealerModels.MDealer>;
  filter: commonModels.Filter;
  meta: commonModels.Meta;
}

export const initialState: MDealersState = {
  fetching: false,
  didFetch: false,
  processing: false,
  data: [],
  filter: {
    search: '',
    order_by: 'id',
    order_dir: 'asc',
    page: 1,
    per_page: 20,
  },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 0,
    path: '',
    per_page: 0,
    to: 0,
    total: 0,
  },
};

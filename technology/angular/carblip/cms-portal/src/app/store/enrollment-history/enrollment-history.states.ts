import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';

export interface enrollmentHistoryState {
    fetching: boolean;
    didFetch: boolean;
    data: Array<logModels.Log>;
    filter: commonModels.Filter;
    meta: commonModels.Meta;
}

export const initialState: enrollmentHistoryState = {
    fetching: false,
    didFetch: false,
    data: [],
    filter: {
      search: '',
      // order_by: 'created_at',
      // order_dir: 'desc',
      page: 1,
      per_page: 10,
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
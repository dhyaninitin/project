import * as commonModels from 'app/shared/models/common.model';
import * as requestModels from 'app/shared/models/request.model';

export interface YearsState {
  fetching: boolean;
  didFetch: boolean;
  processing: boolean;
  data: Array<requestModels.Years>;
  filter: requestModels.Filter;
  meta: commonModels.Meta;
}

export const yearInitialState: YearsState = {
  fetching: false,
  didFetch: false,
  processing: false,
  data: [],
  filter: {
    search: '',
    filter: {},
    order_by: 'request_made_at',
    order_dir: 'desc',
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

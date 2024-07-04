import * as commonModels from 'app/shared/models/common.model';
import * as vehicleData from 'app/shared/models/vehicledata.model';

export interface BrandState {
  fetching: boolean;
  didFetch: boolean;
  data: Array<vehicleData.Brand>;
  filter: vehicleData.Filter;
  meta: commonModels.Meta;
}

export const brandInitialState: BrandState = {
  fetching: false,
  didFetch: false,
  data: [],
  filter: {
    search: '',
    page: 1,
    per_page: 50,
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

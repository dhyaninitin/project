import * as commonModels from 'app/shared/models/common.model';
import * as vehicleData from 'app/shared/models/vehicledata.model';

export interface VehileDataState {
  fetching: boolean;
  didFetch: boolean;
  data: Array<vehicleData.Year>;
  filter: vehicleData.Filter;
  meta: commonModels.Meta;
}

export const initialState: VehileDataState = {
  fetching: false,
  didFetch: false,
  data: [],
  filter: {
    search: '',
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

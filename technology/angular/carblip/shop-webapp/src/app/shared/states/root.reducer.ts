import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { enableBatching } from 'redux-batched-actions';

import { IStore } from 'app/shared/interfaces/store.interface';
import { authReducer } from 'app/shared/states/auth/auth.reducer';
import { brandReducer } from 'app/shared/states/brands/brands.reducer';
import { customRequestReducer } from 'app/shared/states/custom-request/custom-request.reducer';
import { modelReducer } from 'app/shared/states/models/models.reducer';
import { requestsReducer } from 'app/shared/states/my-request/myrequests.reducer';
import { requestReducer } from 'app/shared/states/request/request.reducer';
import { trimReducer } from 'app/shared/states/trim/trim.reducer';
import { uiReducer } from 'app/shared/states/ui/ui.reducer';
import { environment } from 'environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { configurationReducer } from './configuration/configuration.reducer';
import { creditApplicationReducer } from './credit-application/credit-application.reducer';
import { leaseReducer } from './lease/lease.reducer';
import { searchReducer } from './search/search.reducer';

// ------------------------------------------------------------------------------

export const reducers: ActionReducerMap<IStore> = {
  // pass your reducers here
  ui: uiReducer,
  brand: brandReducer,
  model: modelReducer,
  auth: authReducer,
  trim: trimReducer,
  request: requestReducer,
  customRequest: customRequestReducer,
  myRequests: requestsReducer,
  lease: leaseReducer,
  configuration: configurationReducer,
  search: searchReducer,
  creditApplication: creditApplicationReducer,
};

// ------------------------------------------------------------------------------

export function localStorageSyncReducer(
  reducer: ActionReducer<IStore>
): ActionReducer<IStore> {
  return localStorageSync({
    keys: [
      // 'brand',
      // 'model',
      // 'trim',
      // 'configuration',
      // 'request',
      // 'customRequest',
      // 'myRequests',
      // 'auth',
      // 'creditApplication',
      // 'search',
      // 'ui',
    ],
    rehydrate: true,
  })(reducer);
}

// if environment is != from production
// use storeFreeze to avoid state mutation
const metaReducersDev = [storeFreeze, enableBatching, localStorageSyncReducer];

// enableBatching allows us to dispatch multiple actions
// without letting the subscribers being warned between the actions
// only at the end : https://github.com/tshelburne/redux-batched-actions
// can be very handy when normalizing HTTP response
const metaReducersProd = [enableBatching, localStorageSyncReducer];

export const metaReducers = environment.production
  ? metaReducersProd
  : metaReducersDev;

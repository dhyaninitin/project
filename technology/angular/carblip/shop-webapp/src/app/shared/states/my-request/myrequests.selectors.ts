import { createFeatureSelector, createSelector } from '@ngrx/store';
import { brandsAdapter } from 'app/shared/states/brands/brands.reducer';
import { IMyRequests } from 'app/shared/states/my-request/myrequests.interfaces';

export const selectMyRequestsState = createFeatureSelector<IMyRequests>(
  'myRequests'
);

export const {
  // select the array of brand ids
  selectIds: selectMyRequestIds,

  // select the dictionary of brand entities
  selectEntities: selectMyRequestEntities,

  // select the array of brands
  selectAll: selectAllMyRequests,

  // select the total brand count
  selectTotal: selectMyRequestTotal,
} = brandsAdapter.getSelectors();

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization
export const selectCurrentMyRequestId = createSelector(
  selectMyRequestsState,
  state => state.selected
);

export const selectCurrentMyRequest = createSelector(
  selectMyRequestsState,
  selectCurrentMyRequestId,
  ({ entities }, myRequestId) => entities[myRequestId]
);

export const getRequestsAsArray = createSelector(
  selectMyRequestsState,
  requestState =>
    Object.keys(requestState.entities).map(function(key) {
      return requestState.entities[key];
    })
);

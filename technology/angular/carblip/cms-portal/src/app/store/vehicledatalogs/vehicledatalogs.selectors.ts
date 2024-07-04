import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehicleDataLogsState } from './vehicledatalogs.states';

export const name = 'vehicledatalogs';
export const vehicleDataLogsSelector = createFeatureSelector<VehicleDataLogsState>(
  name
);

export const didFetchSelector = createSelector(
  vehicleDataLogsSelector,
  (state: VehicleDataLogsState) => state.didFetch
);

export const fetchingSelector = createSelector(
  vehicleDataLogsSelector,
  (state: VehicleDataLogsState) => state.fetching
);

export const dataSelector = createSelector(
  vehicleDataLogsSelector,
  (state: VehicleDataLogsState) => state.data
);

export const filterSelector = createSelector(
  vehicleDataLogsSelector,
  (state: VehicleDataLogsState) => state.filter
);

export const metaSelector = createSelector(
  vehicleDataLogsSelector,
  (state: VehicleDataLogsState) => state.meta
);

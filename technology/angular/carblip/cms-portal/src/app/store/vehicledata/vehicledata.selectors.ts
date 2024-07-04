import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehileDataState } from './vehicledata.states';
import { BrandState } from './brand.states';
import { ModelState } from './model.states';
import { TrimState } from './trim.states';

export const name = 'vehiledata';
export const brandname = 'brand';
export const modelname = 'model';
export const trimname = 'trim';



export const vechiledataSelector = createFeatureSelector<VehileDataState>(name);
export const brandSelector = createFeatureSelector<BrandState>(brandname);
export const modelSelector = createFeatureSelector<ModelState>(modelname);
export const trimSelector = createFeatureSelector<TrimState>(trimname);



export const didFetchSelector = createSelector(
  vechiledataSelector,
  (state: VehileDataState) => state.didFetch
);

export const fetchingSelector = createSelector(
  vechiledataSelector,
  (state: VehileDataState) => state.fetching
);

export const dataSelector = createSelector(
  vechiledataSelector,
  (state: VehileDataState) => state.data
);

export const filterSelector = createSelector(
  vechiledataSelector,
  (state: VehileDataState) => state.filter
);

export const metaSelector = createSelector(
  vechiledataSelector,
  (state: VehileDataState) => state.meta
);

// Brand data selector

export const BrandDataSelector = createSelector(
  brandSelector,
  (state: BrandState) => state.data
);

export const brandMetaSelector = createSelector(
  brandSelector,
  (state: BrandState) => state.meta
);

export const brandDidFetchSelector = createSelector(
  brandSelector,
  (state: BrandState) => state.didFetch
);

// model data selector

export const ModelDataSelector = createSelector(
  modelSelector,
  (state: ModelState) => state.data
);

export const modelMetaSelector = createSelector(
  modelSelector,
  (state: ModelState) => state.meta
);

export const ModelDidFetchSelector = createSelector(
  modelSelector,
  (state: ModelState) => state.didFetch
);

export const ModelFetchingSelector = createSelector(
  modelSelector,
  (state: ModelState) => state.fetching
);

// Trim data selector

export const TrimDataSelector = createSelector(
  trimSelector,
  (state: TrimState) => state.data
);

export const TrimMetaSelector = createSelector(
  trimSelector,
  (state: TrimState) => state.meta
);

export const TrimDidFetchSelector = createSelector(
  trimSelector,
  (state: TrimState) => state.didFetch
);

export const TrimFetchingSelector = createSelector(
  trimSelector,
  (state: TrimState) => state.fetching
);
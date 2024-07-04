import { createFeatureSelector, createSelector } from '@ngrx/store';

import { modelsAdapter } from 'app/shared/states/models/models.reducer';

import { IModelsGroup } from 'app/shared/states/models/models.interfaces';

export const selectModelsState = createFeatureSelector<IModelsGroup>('model');

export const {
  // select the array of model ids
  selectIds: selectModelIds,

  // select the dictionary of model entities
  selectEntities: selectModelEntities,

  // select the array of models
  selectAll: selectAllModels,

  // select the total model count
  selectTotal: selectModelTotal,
} = modelsAdapter.getSelectors();

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization
export const selectCurrentModelId = createSelector(
  selectModelsState,
  modelState => modelState.selected
);

export const selectYear = createSelector(
  selectModelsState,
  modelState => modelState.year
);

export const selectCurrentModel = createSelector(
  selectModelsState,
  selectCurrentModelId,
  ({ entities }, modelId) => entities[modelId]
);

export const getModelsAsArray = createSelector(
  selectModelsState,
  modelState =>
    Object.keys(modelState.entities).map(function(key) {
      return modelState.entities[key];
    })
);

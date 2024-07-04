import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import * as ModelsActions from 'app/shared/states/models/models.actions';

import {
  IModel,
  IModelsGroup,
} from 'app/shared/states/models/models.interfaces';

export const modelsAdapter: EntityAdapter<IModel> = createEntityAdapter<IModel>(
  {
    selectId: (model: IModel) => model.id,
    sortComparer: false,
  }
);

const modelsInitialState = modelsAdapter.getInitialState({
  year: null,
  selected: null,
  fetching: false,
  didFetch: false,
  errors: [],
});

export function modelReducer(
  state: IModelsGroup = modelsInitialState,
  action: ModelsActions.All
): IModelsGroup {
  switch (action.type) {
    case ModelsActions.FETCH_MODEL_LIST: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        errors: [],
      };
    }

    case ModelsActions.FETCH_MODEL_LIST_SUCCESS: {
      return modelsAdapter.addAll(action.payload.data, {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [],
      });
    }

    case ModelsActions.FETCH_MODEL_LIST_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case ModelsActions.SELECT_MODEL: {
      return {
        ...state,
        selected: action.id,
      };
    }

    case ModelsActions.UPDATE_YEAR: {
      return {
        ...state,
        year: action.year,
      };
    }

    case ModelsActions.CLEAR_MODEL_LIST: {
      return {
        ...modelsInitialState,
      };
    }

    default:
      return state;
  }
}

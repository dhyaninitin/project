import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import * as TrimActions from 'app/shared/states/trim/trim.actions';

import { ITrim, ITrimGroup } from 'app/shared/states/trim/trim.interfaces';

export const trimAdapter: EntityAdapter<ITrim> = createEntityAdapter<ITrim>({
  selectId: (trim: ITrim) => trim.id,
  sortComparer: false,
});

const trimInitialState = trimAdapter.getInitialState({
  selected: null,
  fetching: false,
  didFetch: false,
  errors: [],
});

export function trimReducer(
  state: ITrimGroup = trimInitialState,
  action: TrimActions.All
): ITrimGroup {
  switch (action.type) {
    case TrimActions.FETCH_TRIM_LIST: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        errors: [],
      };
    }

    case TrimActions.FETCH_TRIM_LIST_SUCCESS: {
      return trimAdapter.addAll(action.payload.data, {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [],
      });
    }

    case TrimActions.FETCH_TRIM_LIST_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case TrimActions.SELECT_TRIM: {
      return {
        ...state,
        selected: action.id,
      };
    }

    case TrimActions.CLEAR_TRIM_LIST: {
      return {
        ...trimInitialState,
      };
    }

    default:
      return state;
  }
}

import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import * as BrandsActions from 'app/shared/states/brands/brands.actions';

import {
  IBrand,
  IBrandsGroup,
} from 'app/shared/states/brands/brands.interfaces';

export const brandsAdapter: EntityAdapter<IBrand> = createEntityAdapter<IBrand>(
  {
    selectId: (brand: IBrand) => brand.id,
    sortComparer: false,
  }
);

const brandsInitialState = brandsAdapter.getInitialState({
  selected: null,
  fetching: false,
  didFetch: false,
  errors: [],
});

export function brandReducer(
  state: IBrandsGroup = brandsInitialState,
  action: BrandsActions.All
): IBrandsGroup {
  switch (action.type) {
    case BrandsActions.FETCH_BRAND_LIST: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        errors: [],
      };
    }

    case BrandsActions.FETCH_BRAND_LIST_SUCCESS: {
      return brandsAdapter.addAll(action.payload.data, {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [],
      });
    }

    case BrandsActions.FETCH_BRAND_LIST_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case BrandsActions.SELECT_BRAND: {
      return {
        ...state,
        selected: action.id,
      };
    }

    case BrandsActions.CLEAR_BRAND_LIST: {
      return {
        ...brandsInitialState,
      };
    }

    case BrandsActions.CLEAR_BRAND_LIST_WITHOUT_SELECT: {
      return {
        ...brandsInitialState,
        selected: state.selected,
      };
    }

    default:
      return state;
  }
}

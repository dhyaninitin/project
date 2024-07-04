import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import * as SearchActions from 'app/shared/states/search/search.actions';

import {
  ISearchItem,
  ISearchItemGroup,
} from 'app/shared/states/search/search.interfaces';

export const searchAdapter: EntityAdapter<ISearchItem> = createEntityAdapter<
  ISearchItem
>({
  selectId: (searchItem: ISearchItem) => searchItem.id,
  sortComparer: false,
});

const searchInitialState = searchAdapter.getInitialState({
  selected: null,
  fetching: false,
  didFetch: false,
  keyword: '',
  pagination: {
    total: 0,
    per_page: 12,
    current_page: 0,
  },
  errors: [],
});

export function searchReducer(
  state: ISearchItemGroup = searchInitialState,
  action: SearchActions.All
): ISearchItemGroup {
  switch (action.type) {
    case SearchActions.UPDATE_KEYWORD: {
      return {
        ...state,
        keyword: action.payload,
      };
    }

    case SearchActions.FETCH_SEARCH_LIST: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        keyword: action.requestParam.keyword,
        errors: [],
      };
    }

    case SearchActions.FETCH_SEARCH_LIST_SUCCESS: {
      return searchAdapter.addAll(action.payload.data, {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [],
      });
    }

    case SearchActions.FETCH_SEARCH_LIST_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case SearchActions.CLEAR_SEARCH_LIST: {
      return {
        ...searchInitialState,
      };
    }

    default:
      return state;
  }
}

import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';

import * as RequestsAcions from 'app/shared/states/my-request/myrequests.actions';

import {
  IMyRequests,
  IRequest,
} from 'app/shared/states/my-request/myrequests.interfaces';

export const requestsAdapter: EntityAdapter<IRequest> = createEntityAdapter<
  IRequest
>({
  selectId: (request: IRequest) => request.id,
  sortComparer: false,
});

const myRequestsInitialState = requestsAdapter.getInitialState({
  selected: null,
  fetching: false,
  didFetch: false,
  errors: [],
});

export function requestsReducer(
  state: IMyRequests = myRequestsInitialState,
  action: RequestsAcions.All
): IMyRequests {
  switch (action.type) {
    case RequestsAcions.FETCH_REQUEST_LIST: {
      return {
        ...state,
        didFetch: false,
        fetching: true,
      };
    }

    case RequestsAcions.FETCH_REQUEST_LIST_SUCCESS: {
      return requestsAdapter.addAll(action.payload.data, {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [],
      });
    }

    case RequestsAcions.FETCH_REQUEST_LIST_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case RequestsAcions.FETCH_REQUEST_COLOR_SUCCESS: {
      return requestsAdapter.updateOne(
        {
          id: action.payload.id,
          changes: {
            exterior_colors: action.payload.data.exterior_colors,
            interior_colors: action.payload.data.interior_colors,
            colorFeteched: true,
          },
        },
        state
      );
    }

    case RequestsAcions.FETCH_REQUEST_COLOR_FAILED: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        errors: [...state.errors, action.payload.error],
      };
    }

    case RequestsAcions.SELECT_MY_REQUEST: {
      return {
        ...state,
        selected: action.id,
      };
    }

    case RequestsAcions.CLEAR_REQUEST_LIST: {
      return {
        ...myRequestsInitialState,
      };
    }

    default:
      return state;
  }
}

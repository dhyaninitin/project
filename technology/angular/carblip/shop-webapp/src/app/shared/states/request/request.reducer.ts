import { createFeatureSelector } from '@ngrx/store';

import * as RequestActions from 'app/shared/states/request/request.actions';
import { requestInitialState } from 'app/shared/states/request/request.initial-state';
import { IRequest } from 'app/shared/states/request/request.interface';

export const selectUiState = createFeatureSelector<IRequest>('request');
const initialState = requestInitialState();

export function requestReducer(
  state: IRequest = initialState,
  action: RequestActions.All
): IRequest {
  switch (action.type) {
    case RequestActions.SET_REQUEST_DATA: {
      return {
        ...state,
        ...action.payload.data,
      };
    }

    case RequestActions.SET_CREDIT_SCORE: {
      return {
        ...state,
        credit_score: action.id,
      };
    }

    case RequestActions.CLEAR_REQUEST_DATA: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}

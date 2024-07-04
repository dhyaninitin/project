import { createFeatureSelector } from '@ngrx/store';

import * as CustomRequestActions from './custom-request.actions';
import { customRequestInitialState } from './custom-request.initial-state';
import { ICustomRequest } from './custom-request.interface';

export const selectUiState = createFeatureSelector<ICustomRequest>(
  'custom-request'
);
const initialState = customRequestInitialState();

export function customRequestReducer(
  state: ICustomRequest = initialState,
  action: CustomRequestActions.All
): ICustomRequest {
  switch (action.type) {
    case CustomRequestActions.SET_REQUEST_DATA: {
      return {
        ...state,
        ...action.payload.data,
      };
    }

    case CustomRequestActions.SET_CREDIT_SCORE: {
      return {
        ...state,
        credit_score: action.id,
      };
    }

    case CustomRequestActions.CLEAR_REQUEST_DATA: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}

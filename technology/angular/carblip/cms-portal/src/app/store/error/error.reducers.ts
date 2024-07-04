import { ErrorState, initialState } from './error.states';

import { ErrorObj } from 'app/shared/models/common.model';
import * as actions from './error.actions';

export function errorReducer(
  state: ErrorState = initialState,
  action: actions.Actions
): ErrorState {
  switch (action.type) {
    case actions.ADD_ERROR:
      return {
        errors: [...state.errors, action.payload],
      };
    case actions.CLEAR_DETAIL:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

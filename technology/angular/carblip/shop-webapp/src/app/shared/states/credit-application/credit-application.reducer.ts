import { createFeatureSelector } from '@ngrx/store';

import * as CreditApplicationActions from './credit-application.actions';
import { creditApplicationInitialState } from './credit-application.initial-state';
import { ICreditApplicaiton } from './credit-application.interface';

export const selectUiState = createFeatureSelector<ICreditApplicaiton>(
  'custom-request'
);
const initialState = creditApplicationInitialState();

export function creditApplicationReducer(
  state: ICreditApplicaiton = initialState,
  action: CreditApplicationActions.All
): ICreditApplicaiton {
  switch (action.type) {
    case CreditApplicationActions.SET_CREDIT_APPLICATION_DATA: {
      return {
        wayOfApplying: action.payload['wayOfApplying']
          ? action.payload['wayOfApplying']
          : state.wayOfApplying,
        primary: {
          ...state.primary,
          ...action.payload['primary'],
        },
        co: {
          ...state.co,
          ...action.payload['co'],
        },
      };
    }

    case CreditApplicationActions.CLEAR_CREDIT_APPLICATION_DATA: {
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}

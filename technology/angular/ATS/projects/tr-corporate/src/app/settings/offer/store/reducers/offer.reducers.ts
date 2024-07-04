import { Action, createAction, createReducer, on } from '@ngrx/store';
import * as CreateActions from '../actions/create.action';
import { CreateOffer } from '../interface/create';

export const initialState: CreateOffer = {
  stepper: {
    active: 0,
    stepList: ['Offer Details', 'Add Component', 'Add Document'],
    showStepper: false,
  },
  selectedRole: 0,
};

export const offerReducer = createReducer(
  initialState,

  on(CreateActions.setStepper, (state, action) => {
    return {
      ...state,
      stepper: {
        ...state.stepper,
        active: action.data,
      },
    };
  }),

  on(CreateActions.setStepperShow, (state, action) => {
    return {
      ...state,
      stepper: {
        ...state.stepper,
        showStepper: action.data,
      },
    };
  }),

  on(CreateActions.setUserRole, (state, action) => {
    return {
      ...state,
      selectedRole: action.data,
    };
  })
);

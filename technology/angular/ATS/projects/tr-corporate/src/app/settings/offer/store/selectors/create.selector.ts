import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CreateOffer } from '../interface/create';

const getCreateState = createFeatureSelector<CreateOffer>('create');

export const getStepper = createSelector(
  getCreateState,
  (state) => state.stepper.stepList
);

export const isActiveStepper = createSelector(
  getCreateState,
  (state) => state.stepper.showStepper
);

export const getActiveStepperIndex = createSelector(
  getCreateState,
  (state) => state.stepper.active
);

export const getSelectedRole = createSelector(
  getCreateState,
  (state) => state.selectedRole
);

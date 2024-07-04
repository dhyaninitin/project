import { createAction, props } from '@ngrx/store';

export const setStepper = createAction(
  '[create] Set stepper index',
  props<{ data: number }>()
);

export const setStepperShow = createAction(
  '[create] Set stepper show',
  props<{ data: boolean }>()
);

export const setUserRole = createAction(
  '[create] Set user role',
  props<{ data: number }>()
);

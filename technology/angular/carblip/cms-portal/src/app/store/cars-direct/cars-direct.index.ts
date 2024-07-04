import { carsDirectReducer } from './cars-direct.reducers';
import { name } from './cars-direct.selectors';

export const store = {
  name,
  carsDirectReducer: carsDirectReducer,
  config: {},
};

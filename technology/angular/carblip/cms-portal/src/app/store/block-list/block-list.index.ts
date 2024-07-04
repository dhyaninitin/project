import { blockListReducer } from './block-list.reducers';
import { name } from './block-list.selectors';

export const store = {
    name,
    carsDirectReducer: blockListReducer,
    config: {},
};

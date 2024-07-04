import { phoneNumbersReducer } from './phone-numbers.reducers';
import { name } from './phone-numbers.selectors';

export const store = {
    name,
    phoneNumbersReducer: phoneNumbersReducer,
    config: {},
};

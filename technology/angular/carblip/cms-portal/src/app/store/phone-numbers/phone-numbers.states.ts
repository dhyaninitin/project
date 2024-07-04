import * as commonModels from 'app/shared/models/common.model';
import * as phoneNumbersListModels from 'app/shared/models/phone-numbers.model';

export interface PhoneNumbersListState {
    fetching: boolean;
    didFetch: boolean;
    processing: boolean;
    data: Array<phoneNumbersListModels.PhoneNumbersList>;
    filter: commonModels.Filter;
    meta: commonModels.Meta;
}

export const initialState: PhoneNumbersListState = {
    fetching: false,
    didFetch: false,
    processing: false,
    data: [],
    filter: {
        search: '',
        order_by: 'created_at',
        order_dir: 'desc',
        page: 1,
        per_page: 20,
    },
    meta: {
        current_page: 1,
        from: 1,
        last_page: 0,
        path: '',
        per_page: 0,
        to: 0,
        total: 0,
    },
};

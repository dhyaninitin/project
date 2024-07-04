import { initialState, BlockListState } from './block-list.states';

import { BlockList, BlockResponse } from 'app/shared/models/block-list.model';
import * as actions from './block-list.actions';

export function blockListReducer(
    state: BlockListState = initialState,
    action: actions.Actions
): BlockListState {
    switch (action.type) {
        /* Get List */
        case actions.GET_LIST:
            return {
                ...state,
                didFetch: false,
                fetching: true,
                data: [],
            };
        case actions.GET_LIST_SUCCESS:
            return getListSuccessful(state, action.payload);
        /* Get History List */
        case actions.UPDATE_FILTER:
            return {
                ...state,
                didFetch: false,
                data: [],
                filter: {
                    ...state.filter,
                    ...action.payload,
                },
            };
        case actions.UPDATE_META:
            return {
                ...state,
                meta: {
                    ...state.meta,
                    ...action.payload,
                },
            };
        /* Delete */
        case actions.DELETE:
            return {
                ...state,
                processing: true,
            };

        case actions.DELETE_SUCCESS:
            return {
                ...state,
                processing: false,
                didFetch: false,
                data: [],
            };

        case actions.ADD_ERROR:
            return {
                ...state,
                fetching: false,
                processing: false,
            };
        case actions.CLEAR_DETAIL:
            return {
                ...initialState,
            };
        default:
            return state;
    }
}

function getListSuccessful(
    state: BlockListState,
    result: BlockResponse
): BlockListState {
    return {
        ...state,
        fetching: false,
        didFetch: true,
        data: result.data,
        meta: result.meta,
    };
}

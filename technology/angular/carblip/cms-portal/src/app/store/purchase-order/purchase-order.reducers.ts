import { initialState, PurchaseOrderState } from './purchase-order.states';
import * as actions from './purchase-order.actions';
import { PurchaseOrder } from 'app/shared/models/purchase-order.model';

export function purchaseOrderReducer(
  state: PurchaseOrderState = initialState,
  action: actions.Actions
): PurchaseOrderState {
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
    /* Create */
    case actions.CREATE:
      return {
        ...state,
        processing: true,
      };

    case actions.CREATE_SUCCESS:
      return {
        ...state,
        didFetch: false,
        processing: false,
        data: [],
      };

    /* Update */
    case actions.UPDATE:
      return {
        ...state,
        processing: true,
      };

    case actions.UPDATE_SUCCESS:
      return updateSuccessful(state, action.payload);

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
  state: PurchaseOrderState,
  result: any
): PurchaseOrderState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}


function updateSuccessful(state: PurchaseOrderState, result: PurchaseOrder): PurchaseOrderState {
  const data = state.data.slice(0);
  const index = data.findIndex((item: PurchaseOrder) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...state,
    processing: false,
    data: data,
  };
}
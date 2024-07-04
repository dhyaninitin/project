import { initialState, smsTemplateState } from './sms-templates.states';

import { SmsTemplate, WorkflowSmsTemplateResponse } from 'app/shared/models/sms-templates.model';
import * as actions from './sms-templates.actions';

export function smsTemplateReducer(
  state: smsTemplateState = initialState,
  action: actions.Actions
): smsTemplateState {
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

    /* Update */
    case actions.UPDATE:
      return {
        ...state,
        processing: true,
      };

    case actions.UPDATE_SUCCESS:
      return updateSuccessful(state, action.payload);

    /* Toggle */
    case actions.TOGGLE:
      return {
        ...state,
        processing: true,
      };

    case actions.TOGGLE_SUCCESS:
      return updateSuccessful(state, action.payload);

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
  state: smsTemplateState,
  result: WorkflowSmsTemplateResponse
): smsTemplateState {
  return {
    ...state,
    fetching: false,
    didFetch: true,
    data: result.data,
    meta: result.meta,
  };
}

function updateSuccessful(state: smsTemplateState, result: SmsTemplate): smsTemplateState {
  const data = state.data.slice(0);
  const index = data.findIndex((item: SmsTemplate) => item.id === result.id);
  data.splice(index, 1, result);
  return {
    ...state,
    processing: false,
    data: data,
  };
}

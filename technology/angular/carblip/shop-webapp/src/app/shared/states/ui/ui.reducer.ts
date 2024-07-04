import { createFeatureSelector } from '@ngrx/store';

import * as UiActions from 'app/shared/states/ui/ui.actions';
import { uiInitialState } from 'app/shared/states/ui/ui.initial-state';
import { IUi } from 'app/shared/states/ui/ui.interface';

export const selectUiState = createFeatureSelector<IUi>('ui');

export function uiReducer(
  ui: IUi = uiInitialState(),
  action: UiActions.All
): IUi {
  switch (action.type) {
    case UiActions.SET_LANGUAGE: {
      return {
        ...ui,
        language: action.payload.language,
      };
    }

    case UiActions.SET_SUBHEADER_TITLE: {
      return {
        ...ui,
        subHeaderTitle: action.title,
      };
    }

    case UiActions.SET_LAST_STEP: {
      return {
        ...ui,
        lastStep: action.page,
      };
    }

    case UiActions.SET_SHOW_PREV_BUTTON: {
      return {
        ...ui,
        showPrevButton: action.value,
      };
    }

    case UiActions.SET_PREV_BUTTON_ACTIVE: {
      return {
        ...ui,
        activePrevButton: action.value,
      };
    }

    case UiActions.SET_SHOW_NEXT_BUTTON: {
      return {
        ...ui,
        showNextButton: action.value,
      };
    }

    case UiActions.SET_NEXT_BUTTON_ACTIVE: {
      return {
        ...ui,
        activeNextButton: action.value,
      };
    }

    case UiActions.SET_SHOW_SKIP_BUTTON: {
      return {
        ...ui,
        showSkipButton: action.value,
      };
    }

    case UiActions.SET_SHOW_SEARCH_BOX: {
      return {
        ...ui,
        showSearchBox: action.value,
        searchString: null,
      };
    }

    case UiActions.SET_SEARCH_STRING: {
      return {
        ...ui,
        searchString: action.value,
      };
    }

    case UiActions.SET_SEARCH_OPENED: {
      return {
        ...ui,
        searchOpened: action.value,
      };
    }

    case UiActions.SET_CURRENT_PAGE: {
      return {
        ...ui,
        currentPage: action.page,
      };
    }

    case UiActions.SET_PREV_PAGE: {
      return {
        ...ui,
        prevPage: action.page,
      };
    }

    case UiActions.NAVIGATE_BUTTON_CLICK: {
      return {
        ...ui,
        navigateButtonClick: action.payload,
      };
    }

    case UiActions.CLEAR_NAVIGATE_STATE: {
      return {
        ...ui,
        navigateButtonClick: {
          type: '',
          click: false,
        },
      };
    }

    case UiActions.SET_SHOW_STEPPER: {
      return {
        ...ui,
        showStepper: action.value,
      };
    }

    case UiActions.SET_SHOW_CANCEL_SEARCH: {
      return {
        ...ui,
        showCancelSearch: action.value,
      };
    }

    case UiActions.HIDE_ALL_COMPONENT: {
      return {
        ...ui,
        showPrevButton: false,
        showNextButton: false,
        showSkipButton: false,
        showStepper: false,
        showCancelSearch: false,
        showSearchBox: false,
        searchString: null,
        nextButtonLabel: 'Next',
        showBackIcon: false,
        navOpened: false,
      };
    }

    case UiActions.CLEAR_UI_INFO: {
      return {
        ...uiInitialState(),
      };
    }

    case UiActions.SET_SHOW_NEXT_LABEL: {
      return {
        ...ui,
        nextButtonLabel: action.label,
      };
    }

    case UiActions.SET_LOADING_STATUS: {
      return {
        ...ui,
        showLoading: action.status,
      };
    }

    case UiActions.SET_SHOW_BACK_ICON: {
      return {
        ...ui,
        showBackIcon: action.status,
      };
    }

    case UiActions.SET_NAV_OPENED: {
      return {
        ...ui,
        navOpened: action.status,
      };
    }

    case UiActions.SET_NAV_OPENED: {
      return {
        ...ui,
        navOpened: action.status,
      };
    }

    case UiActions.SET_SHOW_RIGHT_BLOCK: {
      return {
        ...ui,
        showRightBlock: action.status,
      };
    }

    case UiActions.SET_NOTIFICATION_MESSAGE: {
      return {
        ...ui,
        notificationMessage: action.message,
      };
    }

    default:
      return ui;
  }
}

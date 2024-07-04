import { IUi } from 'app/shared/states/ui/ui.interface';

// ui is a bit special as it does not need anything "advanced"
// like `ids` or `entities` for a complete advanced example
// take a look into pizza.{reducer | initial-state | interface}.ts
export function uiInitialState(): IUi {
  return {
    language: '',
    subHeaderTitle: '',
    showPrevButton: false,
    activePrevButton: true,
    showNextButton: false,
    activeNextButton: true,
    showSkipButton: false,
    showStepper: false,
    showCancelSearch: false,
    showSearchBox: false,
    searchOpened: false,
    prevPage: null,
    currentPage: null,
    searchString: null,
    nextButtonLabel: 'Next',
    navigateButtonClick: {
      type: '',
      click: false,
    },
    lastStep: null,
    showLoading: false,
    showBackIcon: true,
    navOpened: false,
    showRightBlock: true,
    notificationMessage: '',
  };
}

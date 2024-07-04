export interface INavigator {
  readonly type: string;
  readonly click: boolean;
}

export interface IUi {
  readonly language: string;
  readonly subHeaderTitle: string;
  readonly showPrevButton: boolean;
  readonly activePrevButton: boolean;
  readonly showNextButton: boolean;
  readonly activeNextButton: boolean;
  readonly showSkipButton: boolean;
  readonly showStepper: boolean;
  readonly showCancelSearch: boolean;
  readonly searchOpened: boolean;
  readonly showSearchBox: boolean;
  readonly prevPage: string;
  readonly currentPage: string;
  readonly navigateButtonClick: INavigator;
  readonly lastStep: string;
  readonly nextButtonLabel: string;
  readonly searchString: string;
  readonly showLoading: boolean;
  readonly showBackIcon: boolean;
  readonly navOpened: boolean;
  readonly showRightBlock: boolean;
  readonly notificationMessage: string;
}

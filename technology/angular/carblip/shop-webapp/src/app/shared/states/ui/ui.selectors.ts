import { createSelector } from '@ngrx/store';

import { selectUiState } from './ui.reducer';

export const getLanguage = createSelector(
  selectUiState,
  uiState => uiState.language
);

export const getSubHeaderTitle = createSelector(
  selectUiState,
  uiState => uiState.subHeaderTitle
);

export const getCurrentStep = createSelector(
  selectUiState,
  uiState => uiState.currentPage
);

export const getPrevPage = createSelector(
  selectUiState,
  uiState => uiState.prevPage
);

export const getLastStep = createSelector(
  selectUiState,
  uiState => uiState.lastStep
);

export const getNextButtonLabel = createSelector(
  selectUiState,
  uiState => uiState.nextButtonLabel
);

export const showSkipButton = createSelector(
  selectUiState,
  uiState => uiState.showSkipButton
);

export const getSearchString = createSelector(
  selectUiState,
  uiState => uiState.searchString
);

export const getSearchOpened = createSelector(
  selectUiState,
  uiState => uiState.searchOpened
);

export const getLoadingStatus = createSelector(
  selectUiState,
  uiState => uiState.showLoading
);

export const showBackIcon = createSelector(
  selectUiState,
  uiState => uiState.showBackIcon
);

export const getNavOpened = createSelector(
  selectUiState,
  uiState => uiState.navOpened
);

export const showRightBlock = createSelector(
  selectUiState,
  uiState => uiState.showRightBlock
);

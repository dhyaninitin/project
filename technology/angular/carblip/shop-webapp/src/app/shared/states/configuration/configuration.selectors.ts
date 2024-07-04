import { createFeatureSelector, createSelector } from '@ngrx/store';
import { chromeSelectionStatus } from 'app/core/constant';

import {
  IConfigurationGroup,
  IExteriorColor,
  IInteriorColor,
} from 'app/shared/states/configuration/configuration.interfaces';

export const configurationState = createFeatureSelector<IConfigurationGroup>(
  'configuration'
);

// by using the createSelector function you'll be able to
// keep excellent performance thanks to memoization

export const getConfiguration = createSelector(
  configurationState,
  state => state.data
);

export const getSerializedValue = createSelector(
  configurationState,
  state => state.serializedValue
);

export const getExteriorColors = createSelector(
  configurationState,
  state => {
    let result: Array<IExteriorColor> = [];
    if (state.data && state.data.exterior_colors) {
      result = state.data.exterior_colors.filter(
        item => item.selection_state !== chromeSelectionStatus.excluded
      );
    }
    return result;
  }
);

export const getInteriorColors = createSelector(
  configurationState,
  state => {
    let result: Array<IInteriorColor> = [];
    if (state.data && state.data.interior_colors) {
      result = state.data.interior_colors.filter(
        item => item.selection_state !== chromeSelectionStatus.excluded
      );
    }
    return result;
  }
);

export const getOptions = createSelector(
  configurationState,
  state => {
    return {
      wheel: state.data.options.wheel.filter(
        item => item.selectionState !== chromeSelectionStatus.excluded
      ),
      additional_equipment: state.data.options.additional_equipment.filter(
        item => item.selectionState !== chromeSelectionStatus.excluded
      ),
    };
  }
);

export const getInteriorColorSelected = createSelector(
  configurationState,
  state => state.interior_selected
);

export const getExteriorColorSelected = createSelector(
  configurationState,
  state => state.exterior_selected
);

export const getOptionSelected = createSelector(
  configurationState,
  state => state.option_selected
);

export const getBackgroundImages = createSelector(
  configurationState,
  state => {
    let images = [];
    if (
      state.exterior_selected &&
      state.exterior_selected.VehicleColorsMedia &&
      state.exterior_selected.VehicleColorsMedia.length
    ) {
      images = state.exterior_selected.VehicleColorsMedia.map(
        item => item.url_1280
      );
      images = images.sort();
    }
    return images;
  }
);

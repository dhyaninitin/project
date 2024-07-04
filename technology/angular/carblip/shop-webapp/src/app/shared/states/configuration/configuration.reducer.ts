import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';

import {
  exteriorColorInitialState,
  interiorColorInitialState,
} from 'app/shared/states/configuration/configuration.initial-state';
import {
  IConfiguration,
  IConfigurationGroup,
  IOption,
} from 'app/shared/states/configuration/configuration.interfaces';

const configurationInitialState = {
  data: {
    general: {},
    style: {},
    configuredResult: {},
    vehicle_data: {
      basicInformation: {},
      standardEquipment: [],
      structuredConsumerInformation: [],
      technicalSpecifications: [],
    },
    options: {
      wheel: [],
      additional_equipment: [],
    },
    exterior_colors: [],
    interior_colors: [],
  },
  serializedValue: '',
  exterior_selected: exteriorColorInitialState(null),
  interior_selected: interiorColorInitialState(null),
  option_selected: [],
  fetching: false,
  didFetch: false,
  processing: false,
  errors: [],
};

export function configurationReducer(
  state: IConfigurationGroup = configurationInitialState,
  action: ConfigurationActions.All
): IConfigurationGroup {
  switch (action.type) {
    case ConfigurationActions.FETCH_DEFALUT_CONFIGURATION: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        processing: false,
        errors: [],
      };
    }

    case ConfigurationActions.FETCH_DEFALUT_CONFIGURATION_SUCCESS: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        processing: false,
        data: action.payload.data,
        option_selected: getSelectedOptionsFromConfiguration(
          action.payload.data
        ),
        exterior_selected: getSelectedExteriorFromConfiguration(
          state.data,
          action.payload.data
        ),
        interior_selected: getSelectedInteriorFromConfiguration(
          action.payload.data
        ),
        serializedValue: getSerializeValue(action.payload.data),
        errors: [],
      };
    }

    case ConfigurationActions.FETCH_DEFALUT_CONFIGURATION_FAILED: {
      return {
        ...state,
        fetching: false,
        errors: [...state.errors, action.payload.error],
      };
    }

    case ConfigurationActions.FETCH_CONFIGURATION_BY_ID: {
      return {
        ...state,
        fetching: true,
        didFetch: false,
        processing: false,
        errors: [],
      };
    }

    case ConfigurationActions.FETCH_CONFIGURATION_BY_ID_SUCCESS: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        processing: false,
        data: action.payload.data,
        option_selected: getSelectedOptionsFromConfiguration(
          action.payload.data
        ),
        exterior_selected: getSelectedExteriorFromConfiguration(
          state.data,
          action.payload.data
        ),
        interior_selected: getSelectedInteriorFromConfiguration(
          action.payload.data
        ),
        serializedValue: getSerializeValue(action.payload.data),
        errors: [],
      };
    }

    case ConfigurationActions.FETCH_CONFIGURATION_BY_ID_FAILED: {
      return {
        ...state,
        fetching: false,
        errors: [...state.errors, action.payload.error],
      };
    }

    case ConfigurationActions.TOGGLE_OPTION: {
      return {
        ...state,
        fetching: true,
        errors: [],
      };
    }

    case ConfigurationActions.TOGGLE_OPTION_SUCCESS: {
      return {
        ...state,
        fetching: false,
        didFetch: true,
        processing: false,
        data: formatToggleRespones(state.data, action.payload.data),
        option_selected: getSelectedOptionsFromConfiguration(
          action.payload.data
        ),
        exterior_selected: getSelectedExteriorFromConfiguration(
          state.data,
          action.payload.data
        ),
        interior_selected: getSelectedInteriorFromConfiguration(
          action.payload.data
        ),
        serializedValue: getSerializeValue(action.payload.data),
        errors: [],
      };
    }

    case ConfigurationActions.TOGGLE_OPTION_FAILED: {
      return {
        ...state,
        fetching: false,
        errors: [...state.errors, action.payload.error],
      };
    }

    case ConfigurationActions.CLEAR_DETAIL: {
      return {
        ...configurationInitialState,
      };
    }

    default:
      return state;
  }
}

function formatExteriorColors(
  prevConfiguration: IConfiguration,
  configuration: IConfiguration
) {
  let { exterior_colors: exteriorColors } = configuration;
  const { exterior_colors: prevExteriorColors } = prevConfiguration;
  if (prevExteriorColors) {
    exteriorColors = exteriorColors.map(item => {
      const prevExteriorColorItem = prevExteriorColors.find(
        pItem => pItem.chrome_option_code === item.chrome_option_code
      );
      const VehicleColorsMedia = item.VehicleColorsMedia
        ? item.VehicleColorsMedia
        : prevExteriorColorItem
        ? prevExteriorColorItem.VehicleColorsMedia
        : [];
      return {
        ...item,
        VehicleColorsMedia,
      };
    });
  }
  return exteriorColors;
}

function formatToggleRespones(
  prevConfiguration: IConfiguration,
  configuration: IConfiguration
) {
  return {
    ...configuration,
    exterior_colors: formatExteriorColors(prevConfiguration, configuration),
  };
}

function getSerializeValue(configuration: IConfiguration) {
  const serializedValue =
    (configuration &&
      configuration.style &&
      configuration.style['configurationState'] &&
      configuration.style['configurationState']['serializedValue']) ||
    '';
  return serializedValue;
}

function getSelectedExteriorFromConfiguration(
  prevConfiguration: IConfiguration,
  configuration: IConfiguration
) {
  const exteriorColors = formatExteriorColors(prevConfiguration, configuration);
  const selectedExteriors = exteriorColors.find(
    item => item.selection_state === 'Selected'
  );
  return selectedExteriors || exteriorColorInitialState(null);
}

function getSelectedInteriorFromConfiguration(configuration: IConfiguration) {
  const selectedInteriors = configuration.interior_colors.find(
    item => item.selection_state === 'Selected'
  );
  return selectedInteriors || interiorColorInitialState(null);
}

function getSelectedOptionsFromConfiguration(configuration: IConfiguration) {
  const selectedWheels: Array<IOption> = configuration.options.wheel.filter(
      item => item.selectionState === 'Selected'
    ),
    selectedAdditionals: Array<
      IOption
    > = configuration.options.additional_equipment.filter(
      item => item.selectionState === 'Selected'
    );
  return selectedWheels.concat(selectedAdditionals);
}

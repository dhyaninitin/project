import {
  IConfiguration,
  IExteriorColor,
  IInteriorColor,
  IOption,
} from 'app/shared/states/configuration/configuration.interfaces';

/**
 * pass a Configuration and return an Configuration with its properties + missing ones
 * this function might be helpful to initialize Configuration coming from the server
 */
export function configurationInitialState(
  data: IConfiguration
): IConfiguration {
  const emptyObj: IConfiguration = {
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
    exterior_colors: null,
    interior_colors: null,
  };

  return {
    ...emptyObj,
    ...data,
  };
}

export function exteriorColorInitialState(
  data: IExteriorColor
): IExteriorColor {
  const emptyObj: IExteriorColor = {
    vehicle_id: null,
    color: '',
    simple_color: '',
    chrome_option_code: '',
    oem_option_code: '',
    color_hex_code: '',
    msrp: '',
    invoice: '',
    selection_state: '',
    VehicleColorsMedia: [],
  };

  return {
    ...emptyObj,
    ...data,
  };
}

export function interiorColorInitialState(
  data: IInteriorColor
): IInteriorColor {
  const emptyObj: IInteriorColor = {
    vehicle_id: null,
    color: '',
    simple_color: '',
    chrome_option_code: '',
    oem_option_code: '',
    color_hex_code: '',
    msrp: '',
    invoice: '',
    selection_state: '',
  };

  return {
    ...emptyObj,
    ...data,
  };
}

export function optionInitialState(data: IOption): IOption {
  const emptyObj: IOption = {
    chromeOptionCode: '',
    oemOptionCode: '',
    headerId: null,
    headerName: '',
    consumerFriendlyHeaderId: null,
    consumerFriendlyHeaderName: '',
    optionKindId: null,
    descriptions: [],
    msrp: null,
    invoice: null,
    frontWeight: null,
    rearWeight: null,
    priceState: '',
    affectingOptionCode: '',
    categories: [],
    specialEquipment: false,
    extendedEquipment: false,
    customEquipment: false,
    optionPackage: false,
    optionPackageContentOnly: false,
    discontinued: false,
    optionFamilyCode: '',
    optionFamilyName: '',
    selectionState: '',
    uniqueTypeFilter: null,
  };

  return {
    ...emptyObj,
    ...data,
  };
}

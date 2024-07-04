// ------------------
// FOR A COMMON CONFIGURATION STRUCTURE
// ------------------
export interface IOptionCategory {
  categoryFlag: string;
  categoryId: number;
}

export interface IStandardEquipmentItem {
  headerId: number;
  headerName: string;
  consumerFriendlyHeaderId: number;
  consumerFriendlyHeaderName: string;
  description: string;
  categories: Array<IOptionCategory>;
  upgrade: boolean;
}

export interface IStructuredConsumerInformationItem {
  name: string;
  sequence: number;
  value: string;
}

export interface IStructuredConsumerInformationGroup {
  typeName: string;
  items: Array<IStructuredConsumerInformationItem>;
}

export interface ITechnicalSpecificationItem {
  groupId: number;
  groupName: string;
  headerId: number;
  headerName: string;
  titleId: number;
  titleName: string;
  value: string;
  upgrade: boolean;
  sequence: number;
}

export interface IVehicleColorMedia {
  oem_code: string;
  url_2100: string;
  url_1280: string;
  url_640: string;
  url_320: string;
  shot_code: string;
  type: string;
}

export interface IInteriorColor {
  vehicle_id: number;
  color: string;
  simple_color: string;
  chrome_option_code: string;
  oem_option_code: string;
  color_hex_code: string;
  msrp: string;
  invoice: string;
  selection_state: string;
}

export interface IExteriorColor extends IInteriorColor {
  VehicleColorsMedia: Array<IVehicleColorMedia>;
}

export interface IOptionDescription {
  description: string;
  type: string;
}

export interface IOption {
  chromeOptionCode: string;
  oemOptionCode: string;
  headerId: number;
  headerName: string;
  consumerFriendlyHeaderId: number;
  consumerFriendlyHeaderName: string;
  optionKindId: number;
  descriptions: Array<IOptionDescription>;
  msrp: number;
  invoice: number;
  frontWeight: number;
  rearWeight: number;
  priceState: string;
  affectingOptionCode: string;
  categories: Array<IOptionCategory>;
  specialEquipment: boolean;
  extendedEquipment: boolean;
  customEquipment: boolean;
  optionPackage: boolean;
  optionPackageContentOnly: boolean;
  discontinued: boolean;
  optionFamilyCode: string;
  optionFamilyName: string;
  selectionState: string;
  uniqueTypeFilter: number;
}

export interface IOptionGroup {
  wheel: Array<IOption>;
  additional_equipment: Array<IOption>;
}

export interface IConfiguration {
  readonly general: object;
  readonly style: object;
  readonly configuredResult: object;
  readonly vehicle_data: {
    basicInformation: object;
    standardEquipment: Array<IStandardEquipmentItem>;
    structuredConsumerInformation: Array<IStructuredConsumerInformationGroup>;
    technicalSpecifications: Array<ITechnicalSpecificationItem>;
  };
  readonly options: IOptionGroup;
  readonly exterior_colors: Array<IExteriorColor>;
  readonly interior_colors: Array<IInteriorColor>;
}

export interface IColorOptionGroup {
  readonly exterior_colors: Array<IExteriorColor>;
  readonly interior_colors: Array<IInteriorColor>;
}

// -------------------
// FOR Configuration STORE
// -------------------

export interface IConfigurationGroup {
  // additional entity state properties
  readonly data: IConfiguration;
  readonly serializedValue: string;
  readonly exterior_selected: IExteriorColor;
  readonly interior_selected: IInteriorColor;
  readonly option_selected: Array<IOption>;
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly processing: boolean;
  readonly errors: Array<string>;
}

// ----------------------------------------------------------------------------

// -------------------
// FOR FETCH API REQUEST
// -------------------
// definition of the Request for Fetch List api
export interface IRequestFecthData {
  readonly vehicles: Array<string>;
}

// -------------------
// FOR FETCH API REQUEST BY ID
// -------------------
// definition of the Request for Fetch List api by id
export interface IRequestFecthDataById {
  readonly configuration_state_id: string;
}

// -------------------
// FOR TOGGLE API REQUEST
// -------------------
// definition of the Request for Toggle api
export interface IRequestToggleOption {
  readonly vehicles: Array<string>;
  readonly configuration_state_id: string;
  readonly option: string;
}

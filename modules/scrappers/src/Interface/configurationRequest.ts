export default interface ConfigurationRequestParam {
    accountInfo: any;
    styleId: number;
    returnParameters: {
        includeStandards: boolean;
        includeOptions: boolean;
        includeOptionDescriptions: boolean;
        includeDiscontinuedOptions: boolean;
        splitOptionsForAltDescription: boolean;
        includeSpecialEquipmentOptions: boolean;
        includeExtendedOEMOptions: boolean;
        includeOEMFleetCodes: boolean;
        includeEditorialContent: boolean;
        includeConsumerInfo: boolean;
        includeStructuredConsumerInfo: boolean;
        includeConfigurationChecklist: boolean;
        includeAdditionalImages: boolean;
        includeTechSpecs: boolean;
        measurementSystem: string;
        includeEnhancedPrices: boolean;
        includeStylePackages: boolean;
        includeCustomEquipmentInTotalPrices: boolean;
        includeTaxesInTotalPrices: boolean;
        disableOptionOrderLogic: boolean;
        priceSetting: string;
    };
}

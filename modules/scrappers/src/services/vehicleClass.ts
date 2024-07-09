import { chromeConfig, placeHolder } from '../config/config';
import { colorsPriorityMap, logsTypes, scraperTypes, vehicleScrapingStatus } from '../constants/constants';
import { createClientAsync } from 'soap';
import { formatColors } from '../utils/helpers/formatData';
import VehicleMedia from '../model/vehicleMedia';
import ConfigurationRequestParam from '../Interface/configurationRequest';
import moment from 'moment';
import Vehicles from '../model/vehicle';
import { Op } from 'sequelize';
import Models from '../model/model';
import * as _ from 'underscore'
import * as sentry from '@sentry/node'; import VehicleColors from '../model/vehicleColors';
import InteriorColors from '../model/interiorColors';
import VehicleOptions from '../model/vehicleOptions';
import { createScraperLogs } from '../utils/loggers/logs';
import { formatImageUrl } from '../utils/helpers/uploadImage';
;

export const getVehicleImageOptionFromFetch = async (styleId: number): Promise<any> => {
    const updateOptions = {
        id: styleId,
        image_url_320: placeHolder.image_placeholder_320 || null,
        image_url_640: placeHolder.image_placeholder_640 || null,
        image_url_1280: placeHolder.image_placeholder_1280 || null,
        image_url_2100: placeHolder.image_placeholder_2100 || null,
    };

    try {
        const vehicleColor: any = await getPrimaryVehicleColor(styleId);
        if (vehicleColor) {
            const vehicleMedias: any = await getPrimaryVehicleMediaAllResolutions(styleId, vehicleColor);
            if (vehicleMedias) {
                const media_320 = vehicleMedias.find((media: any) => media.width === 320);
                if (media_320) updateOptions.image_url_320 = formatImageUrl(media_320.url);
                const media_640 = vehicleMedias.find((media: any) => media.width === 640);
                if (media_640) updateOptions.image_url_640 = formatImageUrl(media_640.url);
                const media_1280 = vehicleMedias.find((media: any) => media.width === 1280);
                if (media_1280) updateOptions.image_url_1280 = formatImageUrl(media_1280.url);
                const media_2100 = vehicleMedias.find((media: any) => media.width === 2100);
                if (media_2100) updateOptions.image_url_2100 = formatImageUrl(media_2100.url);
            } else {
                console.log('Primary Vehicle Media is not available');
            }
            return updateOptions;
        } else {
            console.log('Primary Vehicle Color is not available');
            return updateOptions;
        }
    } catch (error) {
        const payload = { media_status: vehicleScrapingStatus.vehicleNotFound }
        await updateVehicleStatus(styleId, payload);
        throw error;
    }
};

export const getPrimaryVehicleColor = async (vehicleId: number) => {
    try {
        const color = await fetchPrimaryVehicleColor(vehicleId);
        return color;
    } catch (error) {
        throw error;
    }
};

export const getPrimaryVehicleMediaAllResolutions = async (vehicleId: number, vehicleColor: any) => {
    try {
        const query = {
            where: {
                vehicle_id: vehicleId,
                primary_color_option_code: vehicleColor.oem_option_code,
                shot_code: 1,
            },
        };

        const result: VehicleMedia[] | null = await VehicleMedia.findAll(query);
        return result;
    } catch (error) {
        throw error;
    }
};

export const fetchPrimaryVehicleColor = async (styleId: number, type?: string) => {
    const configurationRequestParam: ConfigurationRequestParam = {
        accountInfo: chromeConfig.chromeData.accountInfo,
        styleId,
        returnParameters: {
            includeStandards: true,
            includeOptions: true,
            includeOptionDescriptions: true,
            includeDiscontinuedOptions: false,
            splitOptionsForAltDescription: true,
            includeSpecialEquipmentOptions: true,
            includeExtendedOEMOptions: true,
            includeOEMFleetCodes: true,
            includeEditorialContent: true,
            includeConsumerInfo: true,
            includeStructuredConsumerInfo: true,
            includeConfigurationChecklist: true,
            includeAdditionalImages: true,
            includeTechSpecs: true,
            measurementSystem: 'Metric',
            includeEnhancedPrices: true,
            includeStylePackages: true,
            includeCustomEquipmentInTotalPrices: true,
            includeTaxesInTotalPrices: true,
            disableOptionOrderLogic: true,
            priceSetting: 'NoChange',
        },
    };

    try {
        const config = chromeConfig.chromeData;
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getStyleFullyConfiguredByStyleIdAsync(configurationRequestParam);

        if (result && result[0] != null && result[0].configuration) {
            const options = result[0].configuration.options;
            console.log(result[0].configuration.options)
            let exteriorColors = formatColors(styleId, options, 'exterior');
            const interiorColrs = formatColors(styleId, options, 'interior');
            if (type) {
                await updertVehicleOptions(options, styleId)
                await upsertExteriorColors(exteriorColors, styleId);
                await upsertInteriorColors(interiorColrs, styleId);
            } else {
                if (exteriorColors) {
                    exteriorColors = _.sortBy(exteriorColors, (item: any) =>
                        colorsPriorityMap[item.simple_color as keyof typeof colorsPriorityMap]
                    );
                    return exteriorColors[0];
                }
            }
        }

        return null;
    } catch (error) {
        throw error;
    }
};


export const updateModelImagesOnFetch = async (modelId: number) => {
    const updateOptions: any = {
        image_url_320: placeHolder.image_placeholder_320,
        image_url_640: placeHolder.image_placeholder_640,
        image_url_1280: placeHolder.image_placeholder_1280,
        image_url_2100: placeHolder.image_placeholder_2100,
        msrp: null,
        is_new: 0
    }
    let flag = false
    const result = await getStartingVehiclePriceByModel(modelId)
    if (result) {
        flag = true;
        updateOptions.msrp = result.price

    }
    const vehicle: Vehicles = await fetchPrimaryVehicleByModel(modelId);
    if (vehicle) {
        flag = true;
        if (vehicle.image_url_320 === null) {
            updateOptions.is_new = 1;
        }
        updateOptions.image_url_320 = formatImageUrl(vehicle.image_url_320);
        updateOptions.image_url_640 = formatImageUrl(vehicle.image_url_640);
        updateOptions.image_url_1280 = formatImageUrl(vehicle.image_url_1280);
        updateOptions.image_url_2100 = formatImageUrl(vehicle.image_url_2100)

    }
    if (flag) {
        const query = {
            where: { id: modelId }
        }
        try {
            await Models.update(updateOptions, query)
        } catch (error) {
            sentry.captureException(error);
        }
    }
}

// @desc update vehicle and media status
export const updateVehicleStatus = async (styleId: number, payload: any, vehicleInfo?:any, status?: string) => {
    payload.media_update_at = moment().toISOString();
    if (status) payload.is_new = 0; // set vehicle status is_new:0 when all process finished
    const query = {
        where: { id: styleId }
    };

    try {
        await Vehicles.update(payload, query);
        if(vehicleInfo){
            await createScraperLogs(`Media updated for Vehicle ${vehicleInfo.brandName} ${vehicleInfo.modelName} ${vehicleInfo.vehicle[0].trim} for year ${vehicleInfo.year}`, logsTypes.addition, scraperTypes.media)
        }
    } catch (updateError) {
        sentry.captureException(updateError);
        console.error('Error updating vehicle media status:', updateError);
    }
}

export const getStartingVehiclePriceByModel = async (modelId: number) => {
    try {
        const query: any = {
            where: {
                model_id: modelId,
                price: {
                    [Op.gt]: 0
                }
            },
            order: [['price', 'ASC']],
            raw: true
        };

        const result = await Vehicles.findOne(query);
        return result;
    } catch (error) {
        throw error
    }
};


export const fetchPrimaryVehicleByModel = async (modelId: number) => {
    const query: any = {
        order: [['id', 'ASC']],
        where: {
            model_id: modelId,
        },
        raw: true
    };

    try {
        const result = await Vehicles.findAll(query);
        return result[0];
    } catch (error) {
        throw error
    }
};


export const findByIds = async (vehicleIds: any) => {
    const query = {
        where: {
            id: { [Op.in]: vehicleIds },
        }
    };
    try {
        const data = await Vehicles.findAll(query);
        return data;
    } catch (error) {
        throw error
    }
};


export const upsertVehicle = async (options: any) => {
    try {
        const ids = options.map((item: any) => item.id);
        const existingTrims = await Vehicles.findAll({
            where: {
                id: { [Op.in]: ids } // is_new = 0 also
            }
        });

        const alreadyExistsIds = existingTrims.map((trim: Vehicles) => trim.id);
        const trimsToCreate: any = [];

        options.forEach(async (vehicle: any) => {
            if (!alreadyExistsIds.includes(vehicle.id)) {
                let is_inactive = false;
                is_inactive = is_inactive || (vehicle.brand_id === 39 && (vehicle.trim.includes('(GS)') || vehicle.trim.includes('(SE)'))) // Toyota
                is_inactive = is_inactive || (vehicle.brand_id === 5 && vehicle.trim.includes('North America')) // BMW
                vehicle.is_active = !is_inactive
            vehicle.is_new = 1;
                trimsToCreate.push(vehicle);
            }
        });

        if (trimsToCreate.length > 0) {
            await Vehicles.bulkCreate(options, {
                individualHooks: false,
                ignoreDuplicates: true,
                updateOnDuplicate: ['trim', 'model_no', 'updated_at']
            });;
        }
    } catch (error) {
        console.log('Errrr', error)
    }


}

// @desc add vehicle options
export const updertVehicleOptions = async(options:any, vehicleId:number) => {
    try {
        const upsertPromises = options.map(async (option: any) => {
            const payload = {
                where: {
                    vehicle_id: vehicleId,
                    chrome_option_code: option.chromeOptionCode
                },
                defaults: {
                    vehicle_id: vehicleId,
                    chrome_option_code: option.chromeOptionCode,
                    oem_option_code: option.oemOptionCode,
                    header_id: option.headerId,
                    header_name: option.headerName,
                    consumer_friendly_header_id: option.consumerFriendlyHeaderId,
                    consumer_friendly_header_name: option.consumerFriendlyHeaderName,
                    option_kind_id: option.optionKindId,
                    description: JSON.stringify(option.descriptions),
                    msrp: option.msrp,
                    invoice: option.invoice,
                    front_weight: option.frontWeight,
                    rear_weight: option.rearWeight,
                    price_state: option.priceState,
                    affecting_option_code: option.affectingOptionCode,
                    categories: JSON.stringify(option.affectingOptionCode),
                    special_equipment: option.specialEquipment,
                    extended_equipment: option.extendedEquipment,
                    custom_equipment: option.customEquipment,
                    option_package: option.optionPackage,
                    option_package_content_only: option.optionPackageContentOnly,
                    discontinued: option.discontinued,
                    option_family_code: option.optionFamilyCode,
                    option_family_name: option.optionFamilyName,
                    selection_state: option.selectionState,
                    unique_type_filter: option.uniqueTypeFilter
                },
            };
            const [result, created] = await VehicleOptions.findOrCreate(payload);
            console.log(result);
            if (!created) {
                console.log('already exists')
            }
        });

        await Promise.all(upsertPromises);
    } catch (error) {
        sentry.captureException(error);
        console.log('Error', error)
    }
}

// @desc add vehicle colors
export const upsertExteriorColors = async (exteriorColors: any, vehicleId: number) => {
    try {
        const upsertPromises = exteriorColors.map(async (color: any) => {
            const payload = {
                where: {
                    vehicle_id: vehicleId,
                    oem_option_code: color.oem_option_code,
                },
                defaults: {
                    vehicle_id: vehicleId,
                    color: color.color,
                    simple_color: color.simple_color,
                    oem_option_code: color.oem_option_code,
                    color_hex_code: color.color_hex_code,
                    msrp: color.msrp,
                    invoice: color.invoice,
                },
            };
            const [result, created] = await VehicleColors.findOrCreate(payload);
            console.log(result);
            if (!created) {
                console.log('already exists')
            }
        });

        await Promise.all(upsertPromises);
    } catch (error) {
        sentry.captureException(error);
        console.log('Error:', error)
    }
}

// @desc add interior colors
export const upsertInteriorColors = async (interiorColrs: any, vehicleId: number) => {
    try {
        const upsertPromises = interiorColrs.map(async (color: any) => {
            const payload = {
                where: {
                    vehicle_id: vehicleId,
                    oem_option_code: color.oem_option_code,
                },
                defaults: {
                    vehicle_id: vehicleId,
                    color: color.color,
                    simple_color: color.simple_color,
                    oem_option_code: color.oem_option_code,
                    color_hex_code: color.color_hex_code,
                    msrp: color.msrp,
                    invoice: color.invoice,
                },
            };
            const [result, created] = await InteriorColors.findOrCreate(payload);
            console.log(result);
            if (!created) {
                console.log('already exists')
            }
        });

        await Promise.all(upsertPromises);
    } catch (error) {
        sentry.captureException(error);
        console.error('Error:', error);
    }

    // @desc add config results

}

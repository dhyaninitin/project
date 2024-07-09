import { chromeConfig } from '../config/config';
import { allVehicleTypes, chromeMediaBgType, chromeMediaType, colorsPriorityMap, logsTypes, scraperTypes, vehicleScrapingStatus } from '../constants/constants';
import { createClientAsync } from 'soap';
import * as _ from 'underscore';
import { formatStyles, getMediasByResolution } from '../utils/helpers/formatData';
import { createScraperLogs, LogStatus } from '../utils/loggers/logs';
import * as sentry from '@sentry/node';
import Models from '../model/model';
import { uploadImageToOci } from '../utils/helpers/uploadImage';
import { exportCsvFile } from '../utils/helpers/exportCsv';
import Vehicles from '../model/vehicle';
import { fetchPrimaryVehicleColor, findByIds, getVehicleImageOptionFromFetch, updateModelImagesOnFetch, updateVehicleStatus } from '../services/vehicleClass';
import moment from 'moment';
import { Op } from 'sequelize';
import VehicleMedia from '../model/vehicleMedia';
import { slackNotification } from '../utils/helpers/alerts';
import Brands from '../model/brands';

// @desc fetch new models added
export const fetchNewModels = async (year: number, brand: Brands) => {
    try {
        const query = {
            where: {
                [Op.or]: [
                    { is_new: 1 },
                    { image_url_640: null },
                    { image_url_640: { [Op.like]: '%assets/image-coming-soon-640.png%' }}
                ], year, brand_id: brand.id
            }, raw: true
        }
        
        const models = await Models.findAll(query)
        if (models && models.length > 0) {
            const promises = models.map(async(model) => {
                try {
                    const trims: any = await fetchStyles(model.id, year);
                    const ids = _.pluck(trims, 'id');
                    const nameList = {
                        modelName:model.name,
                        brandName:brand.name
                    }
                    await downloadVehicleMedia(trims, ids, year, nameList);
                    await updateModelImagesOnFetch(model.id);
                    
                } catch (error) {
                    sentry.captureException(error);
                    console.error("An error occurred:", error);
                }
            });
            await Promise.all(promises);
        }
    } catch (error) {
        sentry.captureException(error);
        throw error
    }
}

// @desc Fetch new models trims
export const fetchStyles = async (model: number, year: number) => {
    const config = chromeConfig.chromeData;
    const reqPayload = {
        accountInfo: config.accountInfo,
        modelId: model,
        modelYear: year,
        filterRules: {
            vehicleTypes: allVehicleTypes
        }
    };

    try {
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getStylesAsync(reqPayload);
        if (result && result[0].style && result[0] != null) {
            return formatStyles(result[0].style)
        } else {
            return null;
        }

    } catch (err) {
        
        throw err;
    }
}

// @download chrome media
export const downloadVehicleMedia = async (trims: any, styleIds: any, year: number, nameList:any) => {
    for (const styleId of styleIds) {
        const credentials = `${chromeConfig.chromeData.mediaServiceCredential.username}:${chromeConfig.chromeData.mediaServiceCredential.password}`;
        const url = chromeConfig.chromeData.baseMediaUrl + styleId + '.json';

        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(credentials)
        });

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            const vehicle = trims.filter((item: Vehicles) => item.id === styleId)
            if (!response.ok) {
                console.log(`Request failed with status:${response.status}`);
                await createScraperLogs(`No media found for vehicle ${nameList.brandName} ${nameList.modelName} ${vehicle[0].trim} for year ${year}`, logsTypes.error, scraperTypes.media)
            } else {
                const rawResponse = await response.text();
                const mediaData = JSON.parse(rawResponse);
                if (mediaData && mediaData.colorized) {
                    const media = await getMediasByResolution(mediaData.colorized);
                    
                    const payload = { vehicle, year , modelName:nameList.modelName, brandName:nameList.brandName}
                    await processMedia(media, trims, styleId, payload);
                } else {
                    const payload = { media_status: vehicleScrapingStatus.noImages };
                    await updateVehicleStatus(styleId, payload);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            sentry.captureException(error);
            const options = { media_status: vehicleScrapingStatus.apiFailed };
            await updateVehicleStatus(styleId, options);
        }
    }
};

// @desc upload image to OCI and update vechile media
export const processMedia = async (media: any[], trims: any, styleId: number, vehicleInfo: any) => {
    for (const item of media) {
        const url = item['@href'];
        const path = `${styleId}/${item['@primaryColorOptionCode']}_${item['@width']}_${item['@shotCode']}_${item['@backgroundDescription']}.png`;
        try {
            const resultUrl: any = await uploadImageToOci(url, path);
            if (resultUrl) {
                const payload = {
                    vehicle_id: styleId,
                    url: resultUrl,
                    primary_color_option_code: item['@primaryColorOptionCode'],
                    secondary_color_option_code: item['@secondaryColorOptionCode'],
                    primary_rgb: item['@primaryRGBHexCode'],
                    secondary_rgb: item['@secondaryRGBHexCode'],
                    width: item['@width'],
                    height: item['@height'],
                    shot_code: item['@shotCode'],
                    background_type: chromeMediaBgType[item['@backgroundDescription'] as keyof typeof chromeMediaBgType],
                    type: chromeMediaType[item['@type'] as keyof typeof chromeMediaType]
                }
                await upsertVehicleMedia(payload);
            }
        } catch (error) {
            sentry.captureException(error);
            const options = { media_status: vehicleScrapingStatus.partiallyFailed }
            await updateVehicleStatus(styleId, options);
        }
    }
    await getVehicleImageOptions(styleId, vehicleInfo);
}

// @desc update vechile media
export const upsertVehicleMedia = async (options: any) => {
    try {
        const payload: any = {
            where: {
                vehicle_id: options.vehicle_id,
                primary_color_option_code: options.primary_color_option_code,
                width: options.width,
                shot_code: options.shot_code,
                background_type: options.background_type,
            },
            defaults: {
                vehicle_id: options.vehicle_id,
                url: options.url,
                primary_color_option_code: options.primary_color_option_code,
                secondary_color_option_code: options.secondary_color_option_code,
                primary_rgb: options.primary_rgb,
                secondary_rgb: options.secondary_rgb,
                width: options.width,
                height: options.height,
                shot_code: options.shot_code,
                background_type: options.background_type,
                type: options.type,
            },
        };

        const [result, created] = await VehicleMedia.findOrCreate(payload);
        if(!created) {
            await VehicleMedia.update(payload.defaults, {where : {id : result.id}});
        }
        return result;
    } catch (error) {
        throw error;
    }
}

export const getVehicleImageOptions = async (styleId: number, payload: any) => {
    try {
        const options = {
            media_status: vehicleScrapingStatus.success
        };
        const fetchedOptions = await getVehicleImageOptionFromFetch(styleId)
        if (fetchedOptions) {
            fetchedOptions.media_status = vehicleScrapingStatus.success;
        }
        await updateVehicleStatus(styleId, fetchedOptions || options, payload, 'status');
    } catch (error) {
        sentry.captureException(error);
        const options = { media_status: vehicleScrapingStatus.vehicleNotFound }
        await updateVehicleStatus(styleId, options);
    }
}

// @desc get trims ids and export data
export const getTrimsIds = async (modelId: number, ids: any, brandName: string) => {
    await updateModelImagesOnFetch(modelId);
    try {
        const exportData = await findByIds(ids);
        if (exportData) {
            await exportCsvFile(exportData, brandName);
        }
    } catch (error) {
        sentry.captureException(error);
        console.log('Error: ', error)
    }
}

export const todayAddedMediaCount = async (year: number, date:Date) => {
    try {
        const query = {
            where: {
                created_at: {
                    [Op.gte]:  date
                },
                year
            },
        };
        const mediaCount = await Vehicles.count(query);
        const text = `Total media added  ${mediaCount} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`;
        await slackNotification(text);
        await createScraperLogs(`Total media added  ${mediaCount} for year ${year}`, logsTypes.addition, scraperTypes.media);
    } catch (error) {
        throw error;
    }
}

export const todayUpdatedMediaCount = async (year: number, date:Date) => {
    try {
        const query = {
            where: {
                updated_at: {
                    [Op.gte]:  date
                },
                year
            },
        };
        const mediaCount = await Vehicles.count(query);
        const text = `Total media updated  ${mediaCount} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`;
        await slackNotification(text);
        await createScraperLogs(`Total media updated  ${mediaCount} for year ${year}`, logsTypes.addition, scraperTypes.media);
    } catch (error) {
        throw error;
    }
}


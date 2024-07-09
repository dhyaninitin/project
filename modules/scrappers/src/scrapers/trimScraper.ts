import { chromeConfig } from '../config/config';
import { allVehicleTypes, logsTypes, scraperTypes } from '../constants/constants';
import { createClientAsync } from 'soap';
import * as _ from 'underscore';
import { formatStyles } from '../utils/helpers/formatData';
import { createScraperLogs, LogStatus } from '../utils/loggers/logs';
import * as sentry from '@sentry/node';
import Models from '../model/model';
import { Op } from 'sequelize';
import Vehicles from '../model/vehicle';
import moment from 'moment';
import { newlyVehicleAdded, slackNotification } from '../utils/helpers/alerts';
import ScraperLogs from '../model/scraperLogs';

// @desc to sent notification and capture logs about how many new vehciles added
export const todayAddedVehiclesCount = async (year: number, date: Date) => {
    try {
        const query = {
            where: {
                created_at: {
                    [Op.gte]: date
                },
                year
            },
        };
        const vehicleCount = await Vehicles.count(query);
        const text = `Total trim added  ${vehicleCount} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`;
        await slackNotification(text)
        await createScraperLogs(`Total trim added  ${vehicleCount} for year ${year}`, logsTypes.count, scraperTypes.trim)
    } catch (error) {
        throw error;
    }
}

export const fetchBrandsModel = async (models: Models[], brandName: string) => {
    for (const model of models) {
        await fetchStyles(model.id, model.year, brandName);
    }
}

// @desc Fetch all models trims
export const fetchStyles = async (model: number, year: number, brandName: string) => {
    const config = chromeConfig.chromeData;
    const reqPayload = {
        accountInfo: config.accountInfo,
        modelId: model,
        modelYear: year,
        filterRules: {
            vehicleTypes: allVehicleTypes
        }
    }

    try {
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getStylesAsync(reqPayload);
        if (result && result[0]?.style && result[0] != null) {
            const trims = formatStyles(result[0].style)
            await addMissingTrims(trims, brandName, year);
        } else {
            console.log('null')
        }

    } catch (err) {
        throw err;
    }
}

export const addMissingTrims = async (options: any, brandName: string, year: number) => {
    try {
        const ids = _.pluck(options, 'id');
        const existingTrims = await Vehicles.findAll({
            where: {
                id: { [Op.in]: ids } // is_new = 0 also
            }
        });

        const alreadyExistsIds = existingTrims.map((trim: Vehicles) => trim.id);
        const trimsToCreate: any = [];
        const slackAdditions: any = [];
        const vehicleAdditions: any = [`New vehicle additions for brand ${brandName} - ${year}: `];
        const vehiclePriceUpdate:any = [];

        options.forEach((vehicle: any) => {
            if (!alreadyExistsIds.includes(vehicle.id)) {
                let is_inactive = false;
                is_inactive = is_inactive || (vehicle.brand_id === 39 && (vehicle.trim.includes('(GS)') || vehicle.trim.includes('(SE)'))) // Toyota
                is_inactive = is_inactive || (vehicle.brand_id === 5 && vehicle.trim.includes('North America')) // BMW
                vehicle.is_active = !is_inactive
                vehicle.is_new = 1;
                trimsToCreate.push(vehicle);

                const slackText = `New Addition : ${vehicle.year} ${brandName} ${vehicle.model_no} ${vehicle.trim} `
                vehicleAdditions.push(`${vehicle.year} ${brandName} ${vehicle.model_no} ${vehicle.trim}`);
                slackAdditions.push({ content: slackText, status_type: logsTypes.addition, scraper_type: scraperTypes.trim })

            }
        });

        const promises = options.map(async (vehicle: any) => {
            if (alreadyExistsIds.includes(vehicle.id)) {
                const vehicleInfo = existingTrims.filter((item) => item.id === vehicle.id);
                if (vehicleInfo?.length) {
                    if (vehicleInfo[0].price != vehicle.price) {
                        const updatedText = `Vehicle updated for : ${vehicle.year} ${brandName} ${vehicle.model_no} ${vehicle.trim} `
                        vehiclePriceUpdate.push({ content: updatedText, status_type: logsTypes.addition, scraper_type: scraperTypes.trim })
                        await updateVehiclePrice(vehicle.id, vehicle.price);
                    }
                }
            }
        });
        await Promise.all(promises);

        if (trimsToCreate.length > 0) {
            await Vehicles.bulkCreate(trimsToCreate, {
                individualHooks: false,
                ignoreDuplicates: true,
                updateOnDuplicate: ['trim', 'model_no', 'updated_at']
            });
        }
        if (slackAdditions.length > 0) {
            await ScraperLogs.bulkCreate(slackAdditions);
        }
        if (vehicleAdditions.length > 1) {
            const summary = vehicleAdditions.join("\n");
            newlyVehicleAdded(summary)
        }

        if (vehiclePriceUpdate.length > 0) {
            await ScraperLogs.bulkCreate(vehiclePriceUpdate);
        }

    } catch (error) {
        throw error;
    }
}


export const updateVehiclePrice = async (vehicleId: number, newPrice: number) => {
    const query = {
        where: {
            id: vehicleId
        }
    }
    try {
        await Vehicles.update({ price: newPrice }, query);
    } catch (error) {
        sentry.captureException(error);
    }

}

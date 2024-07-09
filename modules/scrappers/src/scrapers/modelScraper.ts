import Brands from '../model/brands';
import { chromeConfig } from '../config/config';
import { allVehicleTypes, logsTypes, scraperMessages, scraperTypes } from '../constants/constants';
import { createClientAsync } from 'soap';
import * as _ from 'underscore';
import { formatModels } from '../utils/helpers/formatData';
import Models from '../model/model';
import { Model, Op } from 'sequelize';
import * as sentry from '@sentry/node';
import { LogStatus, createScraperLogs } from '../utils/loggers/logs';
import moment from 'moment';
import { newlyVehicleAdded, slackNotification } from '../utils/helpers/alerts';
import ScraperLogs from '../model/scraperLogs';

// @desc to sent notification and capture logs about how many new models added
export const todayAddedModalsCount = async (year: number, date:Date) => {
    try {
        const query = {
            where: {
                created_at: {
                    [Op.gte]: date
                },
                year
            },
        };
        const modelsCount = await Models.count(query);
        const text = `Total model added  ${modelsCount} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`;
        await slackNotification(text)
        await createScraperLogs(`Total model added  ${modelsCount} for year ${year}`, logsTypes.count, scraperTypes.model)
    } catch (error) {
        throw error;
    }
};

// @desc get models of brands (year based)
export const getAllModels = async (year: number) => {
    await createScraperLogs(`Model ${scraperMessages.started} for year ${year}`, 0, scraperTypes.model)
    await slackNotification(`Model ${scraperMessages.started} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`)
    const brands = await Brands.findAll({raw: true });
    const selectedBrands = brands.filter((item:Brands) => item.years == null || (item.years && !item.years.includes(year)))
    for (const brand of selectedBrands) {
        await getModels(brand.id, year, brand.name);
    }
}

// @desc Fetch all models of each brand from chromeData
// call addMissingModels function to fetrch models data for each brand and store
export const getModels = async (brandId: number, year: number, brandName:string) => {
    const config = chromeConfig.chromeData;
    const reqPayload = {
        accountInfo: config.accountInfo,
        modelYear: year,
        divisionId: brandId,
        filterRules: {
            vehicleTypes: allVehicleTypes
        }
    };

    try {
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getModelsByDivisionAsync(reqPayload);
        if (result && result[0] != null && result[0].model && result[0].model != null) {
            const chromeModel = formatModels(result[0].model)
            await addMissingModels(chromeModel, brandName, year)
        }
    } catch (err) {
        throw err;
    }
}

// @desc compare chromeData models to database
export const addMissingModels = async (options: any, brandName:string, year:number) => {
    try {
        const ids = _.pluck(options, 'id');
        const newCarIds = ids.filter((item: any) => !chromeConfig.modelsBlocked.includes(item));
        const fetchModels = await Models.findAll({
            where: {
                id: { [Op.in]: newCarIds }
            },
            raw: true
        });

        const alreadyExistsIds = fetchModels.map((model: Models) => model.id);
        const modelsToCreate: any = [];
        const slackAdditions: any = [];

        options.forEach((model: any) => {
            if (!alreadyExistsIds.includes(model.id)) {
                model.is_new = 1;
                modelsToCreate.push(model);
                const slackText = `New model added : ${brandName} ${model.name} ${model.year}`;
                slackAdditions.push({content:slackText, status_type:logsTypes.addition, scraper_type:scraperTypes.model})
            }
        });

        if (modelsToCreate.length > 0) {
            await Models.bulkCreate(modelsToCreate, {
                individualHooks: false,
                ignoreDuplicates: true,
                updateOnDuplicate: ['name', 'data_release_date', 'initial_price_date', 'data_effective_date', 'updated_at']
            });
        }

        if (slackAdditions.length > 0) {
            await ScraperLogs.bulkCreate(slackAdditions);
        }

    } catch (error) {
        throw error;
    }
}

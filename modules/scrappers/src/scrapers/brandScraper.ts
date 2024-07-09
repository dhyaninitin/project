import Brands from '../model/brands';
import { chromeConfig } from '../config/config';
import { allVehicleTypes, logsTypes, scraperMessages, scraperTypes } from '../constants/constants';
import { createClientAsync } from 'soap';
import * as _ from 'underscore';
import { formatBrands } from '../utils/helpers/formatData';
import { createScraperLogs } from '../utils/loggers/logs';
import * as sentry from '@sentry/node';
import moment from 'moment';
import { slackNotification } from '../utils/helpers/alerts';
import ScraperLogs from '../model/scraperLogs';

const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A');

// @desc Fetch all brands from chromeData
// call fetch brands data from out database
export const getAllBrands = async (year: number, selectedYears:any) => {
    const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A');
    await createScraperLogs(`Brand scraper started for ${year}`, 0, scraperTypes.brand)
    await slackNotification(`Brand ${scraperMessages.started} for ${year} at ${dateFormat}`);
    const config = chromeConfig.chromeData;
    const reqPayload = {
        accountInfo: config.accountInfo,
        modelYear: year,
        filterRules: {
            vehicleTypes: allVehicleTypes
        }
    };

    try {
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getDivisionsAsync(reqPayload);
        if (result && result[0].division && result[0] != null) {
            const chromeBrands = formatBrands(result[0].division)
            await addMissingBrands(chromeBrands, year, selectedYears);
            await createScraperLogs(`Brand ${scraperMessages.success} for ${year}`, 0, scraperTypes.brand);
            await slackNotification(`Brand ${scraperMessages.success} for ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        } else {
            return [];
        }

    } catch (err) {
        sentry.captureException(err);
        throw err;
    }
}


// @desc compare chromeData brands to database
// Bulk Insert newBrands data into database
export const addMissingBrands = async (newBrands: any[], year: number, selectedYears:any) => {
    const fetchBrands: any = await Brands.findAll({ raw: true });
    const missingBrands = newBrands.filter((brand: Brands) => {
        return !fetchBrands.some((el: any) => brand.id === el.id);
    });
    
    if (missingBrands.length > 0) {
        const brandAdditions: any = [];
        const brandsBulkInsert = missingBrands.map((brand: Brands) => {
            const newBrand:any = {
                id: brand.id,
                name: brand.name,
                image_url: brand.image_url,
                years: "["+ selectedYears + "]",
              };
            return newBrand;
        });

        try {
            const newAddition = await Brands.bulkCreate(brandsBulkInsert);
            brandsBulkInsert.map(brand => {
                const logText = `New brand added : ${brand.name} for ${year}`;
                brandAdditions.push({content:logText, status_type:logsTypes.addition, scraper_type:scraperTypes.brand})
            })
            
            if (brandAdditions.length > 0) {
                await ScraperLogs.bulkCreate(brandAdditions);
            }
            const text = `Total brands added  ${newAddition.length} for year ${year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`;
            await slackNotification(text);
            await createScraperLogs(`Total brand added  ${newAddition.length} for year ${year}`, logsTypes.count, scraperTypes.brand);
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    } else {
        await createScraperLogs(`Total brand added 0 for year ${year}`, logsTypes.count, scraperTypes.brand);
        // return [];
    }
}

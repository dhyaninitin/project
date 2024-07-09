import * as nodeCron from 'node-cron';
import { getAllBrands } from '../scrapers/brandScraper';
import { getAllModels, todayAddedModalsCount } from '../scrapers/modelScraper';
import { createScraperLogs, getScraperStatus} from '../utils/loggers/logs';
import Models from '../model/model';
import { chromeConfig, schedulerTime } from '../config/config';
import * as sentry from '@sentry/node';
import Years from '../model/years';
import Brands from '../model/brands';
import { scraperLogs, logsTypes, allVehicleTypes, scraperTypes, scraperMessages } from '../constants/constants';
import { fetchBrandsModel, todayAddedVehiclesCount } from '../scrapers/trimScraper';
import { fetchNewModels, todayAddedMediaCount, todayUpdatedMediaCount } from '../scrapers/mediaScraper';
import { fetchAndUpdateModels } from './modelPrice';
import { createClientAsync } from 'soap';
import * as _ from 'underscore';
import moment from 'moment';
import { slackNotification } from '../utils/helpers/alerts';


// @desc Brand scraper function
export const getBrands = async (year: Years, selectedYears:any) => {
    const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')
    try {
        await getAllBrands(Number(year.year), selectedYears);
    } catch (error) {
        await slackNotification(`Brand ${scraperMessages.failed} at ${dateFormat}`);
        await createScraperLogs(`Brand ${scraperMessages.failed}`, 0, scraperTypes.brand);
        throw new Error(`Brand ${scraperMessages.failed}. Exception : ${error}`);
    }
}

// @desc Model scraper function
export const getModels = async (year: Years) => {
    const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A');
    const newDate = new Date();
    try {
        await getAllModels(Number(year.year));
        await todayAddedModalsCount(Number(year.year), newDate);
        await slackNotification(`Model ${scraperMessages.success} for year ${year.year} at  ${dateFormat}`);
        await createScraperLogs(`Model ${scraperMessages.success} for year ${year.year}`, 0, scraperTypes.model);
    } catch (error) {
        await slackNotification(`Model ${scraperMessages.failed} for year ${year.year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        await createScraperLogs(`Model ${scraperMessages.failed} for year ${year.year}`, 0, scraperTypes.model);
        throw new Error(`Model ${scraperMessages.failed}. Exception : ${error}`);
    }

}

// @desc Trim scraper function
export const getTrims = async (year: any) => {
    const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A');
    const newDate = new Date();
    try {
        await slackNotification(`Trim ${scraperMessages.started} for year ${year.year} at ${dateFormat}`);
        await createScraperLogs(`Trim ${scraperMessages.started} for year ${year.year}`, 0, scraperTypes.trim);
        const brands = await Brands.findAll({ where: {}, raw: true });
        const selectedBrands = brands.filter((item: Brands) => item.years == null || (item.years && !item.years.includes(Number(year.year))));
        for (const brand of selectedBrands) {
            const models: any = await Models.findAll({ where: { year: year.year, brand_id: brand.id }, raw: true });
            await fetchBrandsModel(models, brand.name);
        }
        await fetchAndUpdateModels();
        await todayAddedVehiclesCount(Number(year.year), newDate);
        await slackNotification(`Trim ${scraperMessages.success} for year ${year.year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        await createScraperLogs(`Trim ${scraperMessages.success} for year ${year.year}`, 0, scraperTypes.trim);
    } catch (error) {
        await slackNotification(`Trim ${scraperMessages.failed} for year ${year.year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        await createScraperLogs(`Trim ${scraperMessages.failed} for year ${year.year}`, 0, scraperTypes.trim);
        throw new Error(`Trim ${scraperMessages.failed}. Exception : ${error}`);
    }
}

// @desc media scraper function
export const getMedias = async (year: Years) => {
    const dateFormat = moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A');
    const newDate = new Date();
    try {
        await slackNotification(`Media ${scraperMessages.started} for year ${year.year} at ${dateFormat}`);
        await createScraperLogs(`Media ${scraperMessages.started} for year ${year.year}`, 0, scraperTypes.media);
        const brands = await Brands.findAll({ raw: true });
        const selectedBrands = brands.filter((item: Brands) => item.years == null || (item.years && !item.years.includes(Number(year.year))));
        for (const brand of selectedBrands) {
            await fetchNewModels(Number(year.year), brand);
        }
        await todayAddedMediaCount(Number(year.year), newDate);
        await todayUpdatedMediaCount(Number(year.year), newDate);
        await slackNotification(`Media ${scraperMessages.success} for year ${year.year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        await createScraperLogs(`Media ${scraperMessages.success} for year ${year.year}`, 0, scraperTypes.media);
    } catch (error) {
        await slackNotification(`Media ${scraperMessages.failed} for year ${year.year} at ${moment().tz('America/Los_Angeles').format('MM/DD/YYYY h:mm A')}`);
        await createScraperLogs(`Media ${scraperMessages.failed} for year ${year.year}`, 0, scraperTypes.media);
        throw new Error(`Media ${scraperMessages.failed}. Exception : ${error}`);
    }
}

// @desc run all scrappers and allow upto 3 attempts for particular scraper incase any scraper failed
export const runAllScrapers = async (scrapersFunc: () => Promise<any>, retry: number): Promise<void> => {
    for (let attempt = 1; attempt <= retry; attempt++) {
        try {
            await scrapersFunc();
            return;
        } catch (error: any) {
            sentry.captureException(error);
            if (attempt < retry) {
                console.log('Attempting again to run scrapper')
            } else {
                console.log('failed to run scraper')
            }
        }
    }


}

// @desc node-scheduler
export const startScheduler = () => {
    const scheduleTime = schedulerTime as string;

    const cronJob = nodeCron.schedule(scheduleTime, async () => {
        await getScraperStatus("Scrapers are in progress", logsTypes.scraper, scraperLogs.inProgress, 1);
        try {
            await addYearsAndStartScrapers();
            await getScraperStatus("Scrapers ran successfully", logsTypes.scraper, scraperLogs.success, 1);
        } catch (error) {
            sentry.captureException(error);
            await getScraperStatus("Scrapers failed", logsTypes.scraper, scraperLogs.failed, 1);
        }

    })
    cronJob.start();
}


// @desc fetch selected brands for year selected fro DB
export const fetchYearsSelected = async () => {
    const query = { where: { is_scrapable: 1 }, raw: true }
    const fetchYears = await Years.findAll(query);
    if(fetchYears && fetchYears.length > 0){
        const scrapableYears = _.pluck(fetchYears, 'year');
        for (const year of fetchYears) {
            await runAllScrapers(() => getMedias(year), 1);
        }
    } else {
        console.log('No years selected');
    }
}

export const addYearsAndStartScrapers = async () => {
    try {
        await addFutureYears();
        await fetchYearsSelected();
    } catch (error) {
        sentry.captureException(error);
        await getScraperStatus("Scrapers failed", logsTypes.scraper, scraperLogs.failed, 1);
    }
}

export const addFutureYears = async () => {
    const config = chromeConfig.chromeData;
    const reqPayload = {
        accountInfo: config.accountInfo,
        filterRules: {
            vehicleTypes: allVehicleTypes
        }
    };

    try {
        const client = await createClientAsync(config.baseUrl);
        const result = await client.getModelYearsAsync(reqPayload);
        const fetchYears = await Years.findAll({ raw: true });
        const years = _.pluck(fetchYears, 'year');
        const convertedList: number[] = years.map((year) => parseInt(year, 10));
        const maxElementInArray1: number = Math.max(...convertedList);
        const insertedYears = result[0].i.filter((el: number) => el > maxElementInArray1);
        const data = insertedYears.filter((value: number) => value > 2018 && !convertedList.includes(value)).map((value: number) => ({ year: value }));;
        if (data.length > 0) {
            await Years.bulkCreate(data);
        }

    } catch (err) {
        sentry.captureException(err);
        console.log('Error:', err)
    }
}

import * as CsvWriter from 'csv-writer';
import _ from 'lodash';
import moment from 'moment';
import SlackNotify from 'slack-notify';
import { slackConfig } from '../../config/config';
import * as tz from 'moment-timezone';
import Brands from '../../model/brands';


export const exportCsvFile = async (vehicles: any[], brandName:string) => {
    const createCsvWriter = CsvWriter.createObjectCsvWriter;
    const filename = moment().utc().format('YYYY-MM') + '.csv'
    const csvWriter = createCsvWriter({
        path: 'files/' + filename,
        header: [
            { id: 'year', title: 'Year' },
            { id: 'brand', title: 'Brand' },
            { id: 'model', title: 'Model' },
            { id: 'trim', title: 'Trim' },
            { id: 'created_at', title: 'CreatedAt' },
        ],
        append: true,
    });

    const records = vehicles.map((item) => {
        return {
            brand: brandName,
            model: item?.friendly_model_name,
            year: item?.year,
            trim: item.trim,
            created_at: moment(item.created_at, 'YYYY-MM-DD HH:mm:ss').utc(),
        };
    });

    try {
        await csvWriter.writeRecords(records);
    } catch (err) {
        throw err;
    }
}
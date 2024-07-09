import winston, { createLogger, transports, format } from 'winston';
import ScraperLogs from '../../model/scraperLogs';
import { Op } from 'sequelize';
import * as sentry from '@sentry/node';

// @desc to save in logs file testing purpose
const successfulScraperLogger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, message, action }) => {
      return `${timestamp} - ${message} - Action:${action}`;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/successful_scraper.log' }),
  ],
});

export enum LogStatus {
  STARTED = 'started',
  IN_PROGRESS = 'inProgress',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const createScraperLogs = async (content: string, status_type: number, scraper_type:number): Promise<void> => {
  try {
    await ScraperLogs.create({ content, status_type , scraper_type});
    console.log('Log saved successfully.');
  } catch (error) {
    sentry.captureException(error);
    console.error('Error saving log:', error);
  }
}

const getScraperStatus = async (content: string, status_type: number, status: number, is_running: number) => {
  try {
    const payload = {
      status,
      content,
      status_type,
      is_running
    }
    const [item, created] = await ScraperLogs.findOrCreate({
      where: { status, status_type },
      defaults: payload
    });

    if (!created) {
      const updatedItem = await item.update(payload);
      await updateScraperLogs(status)
      console.log('Updated item:', updatedItem.toJSON());
    } else {
      await updateScraperLogs(status)
    }
  } catch (error) {
    sentry.captureException(error);
    console.error('Error finding/creating item:', error);
  }


}

const updateScraperLogs = async (status: number) => {
  const logs = await ScraperLogs.findAll({ where: { status_type: 1 }, raw: true })
  for (const log of logs) {
    await ScraperLogs.update({ is_running: 0 }, { where: { status: { [Op.ne]: status } } })
  }
}

export { createScraperLogs, successfulScraperLogger, getScraperStatus };
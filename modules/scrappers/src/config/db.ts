import { Dialect, Sequelize } from 'sequelize'
import * as sentry from '@sentry/node';

const dbName = process.env.DB_NAME as string
const dbUser = process.env.DB_USERNAME as string
const dbHost = process.env.DB_HOST
const dbDriver = process.env.DB_DRIVER as Dialect
const dbPassword = process.env.DB_PASSWORD

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDriver
})

// checking connection
const connectToDb = async () => {
  try {
    await sequelizeConnection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    sentry.captureException(error);
    console.error('Unable to connect to the database:', error);
  }
}

export { sequelizeConnection, connectToDb };
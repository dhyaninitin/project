import express from 'express';
import { serverConfig, Sentry } from './config/config';
import http from 'http';
import { connectToDb } from './config/db';
import colors from 'colors';
import { addFutureYears, startScheduler } from './services/scheduler';
import * as sentry from '@sentry/node';
import { fetchPrimaryVehicleColor } from './services/vehicleClass';
import Brands from './model/brands';
import { Op } from 'sequelize';

const app = express();

colors.enable();
connectToDb(); // connect to db

startScheduler();

app.use(express.json());

const httpServer = http.createServer(app);

httpServer.listen(serverConfig.port, () => {
    console.info(`Server is running on ${serverConfig.hostname}:${serverConfig.port}`.blue)
});
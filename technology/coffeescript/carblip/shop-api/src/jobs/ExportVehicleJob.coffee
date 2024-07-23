config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
moment = require 'moment-timezone';
constants = require('../core/constants');

wagner.factory 'config', config


sequelize = require('../utils/db')(wagner)
wagner.factory 'sequelize', () ->
    return sequelize

# adding models
require('../models')(sequelize,wagner)

# adding dependencies
require('../utils/dependencies')(wagner,sequelize)

# adding manager
require('../manager')(wagner)

Raven = require('raven')

Raven.config(process.env.NODE_ENV != 'localhost' && config.SENTRY.dsn, {
  name: config.SENTRY.serverName
  environment: config.SENTRY.environment
  sendTimeout: config.SENTRY.sendTimeout
}).install();

wagner.factory 'Raven', () ->
    return Raven


###
# Job to export all vehicle detail to google sheet
# @param
# @return
###

wagner.get('VehicleManager').getFullVehicleList().then((vehicles) =>
    UpdateFunciton=(pos) ->
        if pos == vehicles.length
            process.exit()
        else
            vehicle = vehicles[pos]
            data = 
                year: vehicle.year
                brand: vehicle?.Brand?.name
                brand_id: vehicle?.Brand?.id
                model: vehicle?.Model?.name
                model_id: vehicle?.Model?.id
                trim: vehicle.trim
                trim_id: vehicle.id  
            wagner.get('ZapierManager').exportVehicleData(data).then (result) =>
                console.log 'success'
                UpdateFunciton(pos+1)
            .catch (error) =>
                console.log error
                UpdateFunciton(pos+1)
    UpdateFunciton(1)
).catch (error)=>
    console.log error   
config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'

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

# wagner.get('VehicleManager').fetchAll('0').then (vehicles) ->
wagner.get('VehicleManager').fetchVehiclesWithoutImages('0', 2024).then (vehicles) ->
  fetchColor=(pos) ->
    if pos == vehicles.length
      process.exit()
    else
      vehicle_id = vehicles[pos].id
      console.log "Fetching for Vehicle Information: ",vehicle_id," ->",vehicles[pos].trim
      wagner.get('ChromeDataManager').downloadVehicleMedia(vehicle_id).then (result)=>
        console.log result
        fetchColor(pos+1)
      .catch (error)=>
        Raven.captureException error
        console.log "Chrome data exception----",error
        fetchColor(pos+1)
  fetchColor(0)
.catch (error)=>
  Raven.captureException error
  console.log "Main catch exception----",error
  fetchColor(pos+1)
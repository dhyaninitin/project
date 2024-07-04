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
# Job to update vehicle request options
###

wagner.get('RequestsManager').getAllRequests(0).then((requests) =>
    UpdateFunciton=(pos) ->
        if pos == requests.length
            process.exit()
        else
            request = requests[pos]
            request_id = request.id
            options = request.VehicleRequestOptions
            configuration_state_id = request.configuration_state_id
            console.log 'Reques Id:', request_id
            if !options.length && configuration_state_id
                @wagner.get('VehicleManager').fetchConfigurationById({configuration_state_id: configuration_state_id}).then (configuration)=>
                    @wagner.get('RequestsManager').formatRequest(request_id).then (formatedRequest) =>
                        @wagner.get('RequestsManager').updateVehicleRequestOptions(formatedRequest, configuration).then (result) =>
                            console.log 'Vehicle Request Options are updated'
                            UpdateFunciton(pos + 1)
                        .catch (error) =>
                            console.log error
                            UpdateFunciton(pos + 1)
                    .catch (error) =>
                        console.log error
                        UpdateFunciton(pos + 1)
                .catch (error) =>
                    console.log error
                    UpdateFunciton(pos + 1)
            else
                UpdateFunciton(pos + 1)
    UpdateFunciton(1)
).catch (error)=>
    console.log error
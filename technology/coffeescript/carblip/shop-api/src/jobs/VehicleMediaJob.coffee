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

wagner.get('VehicleManager').fetchAllByYear(0, 2023).then (vehicles) ->
    updateVehicleData=(pos) ->
        if pos == vehicles.length
            process.exit()
        else
            vehicle_id = vehicles[pos].id
            console.log "Updating vehicle data: ",vehicle_id," ->",vehicles[pos].trim
            
            update_options = 
                id: vehicle_id
                image_url_320: config.image_placeholder_320
                image_url_640: config.image_placeholder_640
                image_url_1280: config.image_placeholder_1280
                image_url_2100: config.image_placeholder_2100
            wagner.get('VehicleManager').getPrimaryVehicleColor(vehicle_id).then (vehicle_color)=>
                if vehicle_color
                    wagner.get('VehicleManager').getPrimaryVehicleMediaAllResolutions(vehicle_id, vehicle_color).then (vehicle_media)=>
                        if vehicle_media
                            [media_320] = vehicle_media.filter (media) -> media.width == 320
                            if media_320
                                update_options.image_url_320 = media_320.url
                            [media_640] = vehicle_media.filter (media) -> media.width == 640
                            if media_640
                                update_options.image_url_640 = media_640.url
                            [media_1280] = vehicle_media.filter (media) -> media.width == 1280
                            if media_1280
                                update_options.image_url_1280 = media_1280.url
                            [media_2100] = vehicle_media.filter (media) -> media.width == 2100
                            if media_2100
                                update_options.image_url_2100 = media_2100.url
                        else
                            console.log 'PrimaryVehicleMedia is not availalble'
                        wagner.get('VehicleManager').update(update_options).then (result)=>
                            console.log 'success'
                            updateVehicleData(pos+1)
                        .catch (error)=>
                            Raven.captureException error
                            console.log error    
                            updateVehicleData(pos+1)
                    .catch (error)=>
                        Raven.captureException error
                        console.log error
                else
                    console.log 'PrimaryVehicleColor is not availalble'
                    wagner.get('VehicleManager').update(update_options).then (result)=>
                        console.log 'success'
                        updateVehicleData(pos+1)
                    .catch (error)=>
                        Raven.captureException error
                        console.log error    
                        updateVehicleData(pos+1)
            .catch (error)=>
                Raven.captureException error
                console.log error
                updateVehicleData(pos+1)

    updateVehicleData(0)
.catch (error)=>
    Raven.captureException error
    console.log error
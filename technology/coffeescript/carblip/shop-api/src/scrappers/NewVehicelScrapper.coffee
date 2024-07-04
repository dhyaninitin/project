config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
moment = require('moment-timezone')

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
# Job to fetch new vehicles for existing models, fill data for vehicle
###

file_name = moment().tz('UTC').format('YYYY-MM') + '.csv'

wagner.get('ModelManager').fetchAll().then (models) ->
    fetchStyle=(pos) ->
        if pos == models.length
            process.exit()
        else
            model_id = models[pos].id
            
            # check if model id is in block list
            if model_id in config.modelsBlocked
                fetchStyle(pos+1)
            else
                console.log "Fetching for model: ",model_id," ->",models[pos].name
                wagner.get('ChromeDataManager').fetchStyleList(model_id).then (vehicles)=>
                    
                    # all vehicle ids from chrome services
                    vehicleIds = _.pluck vehicles,'id'
                    
                    # get new vehicle ids to be added
                    wagner.get('VehicleManager').fetchNewVehicleIds(vehicleIds).then (newIds) =>
                        console.log "New Vehicle Ids: ", newIds
                        newVehicles = _.filter vehicles, (item) =>
                            return item.id in newIds
                        if newVehicles.length
                            async.eachSeries newVehicles, (vehicle, callback) =>
                                vehicle.is_new = 1
                                vehicleId = vehicle.id
                                is_inactive = false;
                                is_inactive = is_inactive || (vehicle.brand_id == 39 && (vehicle.trim.includes('(GS)') || vehicle.trim.includes('(SE)'))) # Toyota
                                is_inactive = is_inactive || (vehicle.brand_id == 5 && vehicle.trim.includes('North America')) # BMW
                                vehicle.is_active = !is_inactive
                                
                                # add vehicle info to vehicle table
                                wagner.get('VehicleManager').create(vehicle).then (result) =>
                                    console.log "Fetching for Vehicle Information: ",vehicleId," ->",vehicle.trim

                                    wagner.get('VehicleManager').findById(vehicleId).then (vehicle) =>
                                        if  vehicle
                                            # download images from chromeservice
                                            wagner.get('ChromeDataManager').downloadVehicleMedia(vehicleId).then (result) =>
                                                console.log 'Images are successfully downloaded'

                                                # update vehicle images
                                                wagner.get('VehicleManager').updateVehicleImages(vehicleId).then (result) =>
                                                    console.log 'Vehicle is updated with Images'
                                                    wagner.get('VehicleManager').update({id: vehicleId, is_new: 0 }).then () =>
                                                        callback(null)
                                                    .catch (err)=>
                                                        console.log(err)
                                                        callback(null)
                                        else
                                            console.log 'failed to add'
                                            callback();
                                .catch (err)=>
                                    callback(err)
                            , (error) =>
                                if error
                                    console.log error
                                    Raven.captureException error
                                else
                                    console.log "Completed for model: ",model_id," ->",models[pos].name
                                    wagner.get('ModelManager').updateModelImagesOnFetch(model_id).then (result)=>
                                        wagner.get('VehicleManager').findByIds(newIds).then (exportData) =>
                                            wagner.get('ExportManager').exportCsvFile(file_name, exportData).then ()=>
                                                console.log('Log Exported Successfully')
                                                fetchStyle(pos+1)
                                            .catch (err)=>
                                                console.log(err)
                                                fetchStyle(pos+1)
                                        .catch (err)=>
                                            console.log(err)
                                            fetchStyle(pos+1)
                                    .catch (err)=>
                                        console.log(err)
                                        fetchStyle(pos+1)
                        else
                            fetchStyle(pos+1)
                    .catch (error)=>
                        console.log error
                        Raven.captureException error
                        fetchStyle(pos+1)
                .catch (error)=>
                    console.log error
                    Raven.captureException error
                    fetchStyle(pos+1)
    fetchStyle(0)
.catch (error)=>
    Raven.captureException error
    console.log error
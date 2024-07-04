config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
moment = require('moment-timezone')

wagner.factory 'config', config
dateFormat = require('dateformat');

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

Slack = require 'node-slackr'
slack = new Slack('https://hooks.slack.com/services/T5UG82JKS/H453fsfsD4JGCMD0/Frewrwerewrwerwerw',
    channel: '#cron'
    username: 'Cron Notification'
    icon_emoji: 'https://a.slack-edge.com/80588/img/icons/app-57.png'
)

file_name = moment().tz('UTC').format('YYYY-MM') + '.csv'

wagner.get('VehicleManager').todayAddedVehiclesCount().then (vehicleAddedCount) ->
    wagner.get('ModelManager').fetchNewModels().then (models) ->
        fetchStyle=(pos) ->
            if pos == models.length
                wagner.get('VehicleManager').todayAddedVehiclesCount().then (vehiclesAddedCounts) ->
                    text = "Trim scraper ran successfully at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " with " + vehiclesAddedCounts + " new additions"
                    
                    slackNotificationSent = 0
                    slack.notify text, (err, result) ->
                        slackNotificationSent = 1
                        if err
                            console.log ('Slack Err: '+ err)
                        else
                            console.log ('Notified')

                    if slackNotificationSent == 1
                        process.exit()
            else
                model_id = models[pos].id
                console.log "Fetching for model: ",model_id," ->",models[pos].name
                wagner.get('ChromeDataManager').fetchStyleList(model_id).then (vehicles)=>
                    vehicleIds = _.pluck vehicles, 'id'

                    async.eachSeries vehicles, (vehicle, callback) =>
                        vehicle.is_new = 1
                        vehicleId = vehicle.id
                        is_inactive = false;
                        is_inactive = is_inactive || (vehicle.brand_id == 39 && (vehicle.trim.includes('(GS)') || vehicle.trim.includes('(SE)'))) # Toyota
                        is_inactive = is_inactive || (vehicle.brand_id == 5 && vehicle.trim.includes('North America')) # BMW
                        vehicle.is_active = !is_inactive
                        
                        wagner.get('VehicleManager').upsertVehicle([vehicle]).then (result) =>
                            console.log "Fetching for Vehicle Information: ",vehicleId," ->",vehicle.trim
                            wagner.get('ChromeDataManager').downloadVehicleMedia(vehicleId).then (result) =>
                                console.log 'Images are successfully downloaded'
                                wagner.get('VehicleManager').updateVehicleImages(vehicleId).then (result) =>
                                    console.log 'Vehicle is updated with Images'
                                    wagner.get('VehicleManager').update({id: vehicleId, is_new: 0 }).then () =>
                                        callback(null)
                                    .catch (err)=>
                                        if err != null
                                            text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  err
                                            
                                            slack.notify text, (err, result) ->
                                                if err
                                                    console.log ('Slack Err: '+ err)
                                                else
                                                    console.log ('Notified')

                                        # console.log(err)
                                        Raven.captureException err
                                        callback(null)
                        .catch (err)=>
                            if err != null
                                text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  err
                                
                                slack.notify text, (err, result) ->
                                    if err
                                        console.log ('Slack Err: '+ err)
                                    else
                                        console.log ('Notified')

                            Raven.captureException err
                            callback(err)
                    , (error) =>
                        if error
                            if error != null
                                text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error
                                
                                slack.notify text, (err, result) ->
                                    if err
                                        console.log ('Slack Err: '+ err)
                                    else
                                        console.log ('Notified')
                            console.log error
                            Raven.captureException error
                        else
                            console.log "Completed for model: ",model_id," ->",models[pos].name
                            wagner.get('ModelManager').updateModelImagesOnFetch(model_id).then (result)=>
                                wagner.get('VehicleManager').findByIds(vehicleIds).then (exportData) =>
                                    wagner.get('ExportManager').exportCsvFile(file_name, exportData).then ()=>
                                        console.log('Log Exported Successfully')
                                        fetchStyle(pos+1)
                                    .catch (err)=>
                                        if err != null
                                            text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  err
                                            
                                            slack.notify text, (err, result) ->
                                                if err
                                                    console.log ('Slack Err: '+ err)
                                                else
                                                    console.log ('Notified')

                                        Raven.captureException err
                                        console.log(err)
                                        fetchStyle(pos+1)
                                .catch (err)=>
                                    if err != null
                                        text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  err
                                        
                                        slack.notify text, (err, result) ->
                                            if err
                                                console.log ('Slack Err: '+ err)
                                            else
                                                console.log ('Notified')

                                    Raven.captureException err
                                    console.log(err)
                                    fetchStyle(pos+1)
                            .catch (err)=>
                                if err != null
                                    text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  err
                                    
                                    slack.notify text, (err, result) ->
                                        if err
                                            console.log ('Slack Err: '+ err)
                                        else
                                            console.log ('Notified')

                                Raven.captureException err
                                console.log(err)
                                fetchStyle(pos+1)
                .catch (error)=>
                    if error != null
                        text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error
                    
                        slack.notify text, (err, result) ->
                            if err
                                console.log ('Slack Err: '+ err)
                            else
                                console.log ('Notified')

                    Raven.captureException error
                    fetchStyle(pos+1)
        fetchStyle(0)
    .catch (error)=>
        if error != null
            text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error
            
            slack.notify text, (err, result) ->
                if err
                    console.log ('Slack Err: '+ err)
                else
                    console.log ('Notified') 

        Raven.captureException error
        console.log error

.catch (error)=>
    if error != null
        text = "Trim scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error
        
        slack.notify text, (err, result) ->
            if err
                console.log ('Slack Err: '+ err)
            else
                console.log ('Notified') 

    Raven.captureException error
    console.log error
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
slack = new Slack('https://hooks.slack.com/services/T5UG82JKS/B0Eewrewrwrff/Dfdstertdasdada',
    channel: '#cron'
    username: 'Cron Notification'
    icon_emoji: 'https://a.slack-edge.com/80588/img/icons/app-57.png'
)

currentYear =  new Date().getFullYear();

wagner.get('ModelManager').todayAddedModelsCount().then (modelCount) ->
    wagner.get('BrandsManager').fetchAllBrands().then (brands) ->
        fetchModel=(pos, year) ->
            if pos == brands.length
                wagner.get('ModelManager').todayAddedModelsCount().then (modelCounts) ->
                    text = "Model scraper ran successfully at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " with " +  modelCounts + " new additions"
                    slackNotificationSent = 0

                    slack.notify text, (err, result) ->
                        slackNotificationSent = 1
                        if err
                            console.log ('Slack Err: ' + err)
                        else
                            console.log ('Notified')

                    if slackNotificationSent == 1
                        process.exit()
            else
                brand_id = brands[pos].id
                console.log "Fetching for ",brand_id,":",brands[pos].name,"(",year,")" 
                wagner.get('ChromeDataManager').fetchModel(brand_id, year).then (result)=>
                    if (year < 2023)
                        fetchModel(pos, year+1)
                    else
                        fetchModel(pos+1, 2020)
                .catch (error)=>
                    console.log error
                    text = "Model scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error
                    
                    slack.notify text, (err, result) ->
                        if err
                            console.log ('Slack Err: ' + err)
                        else
                            console.log ('Notified') 

                    Raven.captureException error
                    if (year < 2021)
                        fetchModel(pos, year+1)
                    else
                        fetchModel(pos+1, 2020)
        fetchModel(0, 2020)
    .catch (error)=>
        text = "Model scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error

        slack.notify text, (err, result) ->
            if err
                console.log ('Slack Err: '+ err)
            else
                console.log ('Notified')
        
        Raven.captureException error
        console.log error

.catch (error)=>
    text = "Model scraper failed at " + moment().tz('America/Los_Angeles').format('DD/MM/YYYY h:mm A') + " for exception " +  error

    slack.notify text, (err, result) ->
        if err
            console.log ('Slack Err: '+ err)
        else
            console.log ('Notified')
    
    Raven.captureException error
    console.log error
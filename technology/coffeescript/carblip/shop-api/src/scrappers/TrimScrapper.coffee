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

wagner.get('ModelManager').fetchAll().then (models) ->
    fetchStyle=(pos) ->
        if pos == models.length
            process.exit()
        else
            model_id = models[pos].id
            console.log "Fetching for model: ",model_id," ->",models[pos].name
            wagner.get('ChromeDataManager').fetchStyle(model_id).then (result)=>
                console.log result
                fetchStyle(pos+1)
            .catch (error)=>
                Raven.captureException error
                console.log error
                fetchStyle(pos+1)
    fetchStyle(0)
.catch (error)=>
    Raven.captureException error
    console.log error
config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'


wagner.factory 'config', config


sequelize = require('../utils/db-portal')(wagner)
wagner.factory 'sequelize', () ->
    return sequelize

# adding models
require('../models-portal')(sequelize,wagner)

# adding dependencies
require('../utils/dependencies')(wagner,sequelize)

# adding manager
require('../manager')(wagner)

wagner.get('MarketScanManager').fetchMakes(false).then (makes) ->
    wagner.get('CMakeManager').upsertMakes(makes).then (result1) ->
        wagner.get('MarketScanManager').fetchMakes(true).then (makes) ->
            wagner.get('CMakeManager').upsertMakes(makes).then (result2) ->
                console.log 'success'            
            .catch (error)=>
                console.log error
        .catch (error)=>
            console.log error
    .catch (error)=>
        console.log error
.catch (error)=>
    console.log error
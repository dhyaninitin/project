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

wagner.get('MarketScanManager').fetchDealer().then (dealers) ->
    wagner.get('CDealerManager').upsertDealers(dealers).then (result) ->
        console.log 'success'
    .catch (error)=>
        console.log error
.catch (error)=>
    console.log error
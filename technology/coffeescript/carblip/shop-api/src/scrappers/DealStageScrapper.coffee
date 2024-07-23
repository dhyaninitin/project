config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
helpers = require('../utils/helper');

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

# wagner.get('HubspotManager').fetchDealStages().then (dealStages) ->
#     console.log "Fetching for DealStage: count - ", dealStages.length
#     dealStages = helpers.formatDealStage(dealStages)
#     wagner.get('DealStageManager').upsertItems(dealStages).then (result) ->
#         console.log 'success'
#     .catch (error)=>
#         console.log error
# .catch (error)=>
#     console.log error
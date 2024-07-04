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

wagner.get('CDealerManager').getAll({is_active: 1}).then (dealers) ->
    async.eachSeries dealers, ((item, callback) =>
        account_id = item.id
        console.log 'Dealer ID:' + account_id
        wagner.get('MarketScanManager').fetchInventory(account_id, false).then (inventories) ->
            wagner.get('CInventoryManager').upsertInventories(inventories).then (result1) ->
                wagner.get('MarketScanManager').fetchInventory(account_id, true).then (inventories) ->
                    wagner.get('CInventoryManager').upsertInventories(inventories).then (result2) ->
                        console.log 'success'
                        callback()
                    .catch (error)=>
                        console.log error
                        callback()
                .catch (error)=>
                    console.log error
                    callback()
            .catch (error)=>
                console.log error
                callback()
        .catch (error)=>
            console.log error
            callback()
    ),(err) ->
        if err
            console.log err
        else
            console.log 'all success'
.catch (error)=>
    console.log error
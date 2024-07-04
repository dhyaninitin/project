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

wagner.get('ChromeDataManager').fetchBrands().then (brands) ->
    console.log("Brandssss",brands);
    fetchModel=(pos) ->
        if pos == brands.length
            process.exit()
        else
            console.log "Fetching for ",brands[pos].id,":",brands[pos].name
            wagner.get('ChromeDataManager').fetchModel(brands[pos].id, config.yearEnabled).then (result)=>
                console.log result
                fetchModel(pos+1)
            .catch (error)=>
                console.log error
                fetchModel(pos+1)
    fetchModel(0)
.catch (error)=>
    console.log error
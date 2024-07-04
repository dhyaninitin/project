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

wagner.get('BrandsManager').fetchAllBrands().then (brands) ->
    fetchModel=(pos) ->
        if pos == brands.length
            process.exit()
        else
            brand = brands[pos]
            brand_id = brand.id
            console.log "Fetching for ",brand_id,":",brands[pos].name 
            wagner.get('BranchIOManager').getBrandLink(brand).then (result)=>
                console.log result
                fetchModel(pos+1)
            .catch (error)=>
                console.log error
                fetchModel(pos+1)
    fetchModel(0)
.catch (error)=>
    Raven.captureException error
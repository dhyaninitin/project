config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'

wagner.factory 'config', config

sequelize = require('../utils/db')(wagner)
wagner.factory 'sequelize',() ->
    return sequelize

# adding models
require('../models')(sequelize,wagner)

# adding models
require('../models-portal')(sequelize,wagner)

# adding dependencies
require('../utils/dependencies')(wagner,sequelize)

# adding manager
require('../manager')(wagner)

wagner.get('BrandsManager').fetchAllBrands().then (brands) ->
    console.log("Brands",brands.length)
    if brands.length < 0
        process.exit()
    else
        wagner.get('EmailTransport').serverDownEmail('changl@gmail.com','hardik.thinktank@gmail.com')
        console.log 'Mail successfully sent'
.catch (error)=>
    console.log error
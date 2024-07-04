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

wagner.get('VehicleManager').fetchAll('0').then (vehicles) ->
  fetchColor=(pos) ->
    if pos == vehicles.length
      process.exit()
    else
      vehicle_id = vehicles[pos].id
      console.log "Fetching for Vehicle Price Information: ",vehicle_id," ->",vehicles[pos].trim
      wagner.get('ChromeDataManager').fetchVehicleInfo(vehicle_id).then (result)=>
        console.log 'success'
        fetchColor(pos+1)
      .catch (error)=>
        console.log error
        fetchColor(pos+1)        
  fetchColor(0)
.catch (error)=>
  console.log error
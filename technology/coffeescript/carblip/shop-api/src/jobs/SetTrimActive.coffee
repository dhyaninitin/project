config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
moment = require 'moment-timezone';

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

wagner.get('VehicleManager').fetchAll(0).then (vehicles) ->
    handle=(pos) ->
        if pos == vehicles.length
            process.exit()
        else
            vehicle = vehicles[pos]
            vehicle_id = vehicle.id
            proceed = false;
            proceed = proceed || (vehicle.brand_id == 39 && (vehicle.trim.includes('(GS)') || vehicle.trim.includes('(SE)'))) # Toyota
            proceed = proceed || (vehicle.brand_id == 5 && vehicle.trim.includes('North America')) # BMW

            if proceed
                console.log "Vehicle ID: ", vehicle_id
                wagner.get('VehicleManager').update({id: vehicle_id, is_active: 0}).then () =>
                    handle(pos+1)
                .catch (error)=>                
                    handle(pos+1)
            else
                handle(pos+1)
    handle(0)
.catch (error)=>
    console.log error
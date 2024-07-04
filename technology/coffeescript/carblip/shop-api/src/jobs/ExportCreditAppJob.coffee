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

wagner.get('CreditApplicationManager').fetchAll().then (credit_apps) ->
    ExportCreditApp=(pos) ->
        if pos == credit_apps.length
            process.exit()
        else
            console.log "Exporting credit application: ", credit_apps[pos].id
            data = credit_apps[pos]
            if !data.is_exported
                request = data.VehicleRequest
                request_id = request.id
                wagner.get('CreditApplicationManager').exportCreditApp(request_id).then((result) =>
                    ExportCreditApp(pos+1)
                ).catch (err)=>
                    console.log err.stack
                    ExportCreditApp(pos+1)
            else
                ExportCreditApp(pos+1)
    ExportCreditApp(0)
.catch (error)=>
    console.log error
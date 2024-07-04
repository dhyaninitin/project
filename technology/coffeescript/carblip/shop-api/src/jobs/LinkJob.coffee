config = require('../config')
wagner = require('wagner-core')
_=require('underscore')
async = require 'async'
moment = require 'moment-timezone';
constants = require('../core/constants');

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

Raven.config(process.env.NODE_ENV != 'localhost' && config.SENTRY.dsn, {
  name: config.SENTRY.serverName
  environment: config.SENTRY.environment
  sendTimeout: config.SENTRY.sendTimeout
}).install();


###
# Job to update deeplink and year for Hubspot Contact
# @param dealId number
# @return
###

wagner.get('HubspotManager').fetchDeals(0).then((result) =>
    UpdateFunciton=(pos) ->
        deals = result['results']
        if pos == deals.length
            process.exit()
        else
            deal = deals[pos]
            deal_id = deal.dealId
            console.log 'deal id: '+deal_id
            contact_id = deal.associations.associatedVids[0]
            make = deal?.properties?.make?.value

            vehicle_type = (_.invert(constants.vehicle_type))[make]
            if !vehicle_type
                model = deal?.properties?.model?.value
                trim = deal?.properties?.trim?.value
            createdate = deal.properties.createdate.value 
            wagner.get('HubspotManager').findContactById(contact_id).then((contact) =>
                email = contact?.properties?.email
                fullname = contact?.properties?.firstname + ' ' + contact?.properties?.lastname
                wagner.get('UserManager').emailExists({email_address: email}).then (user) =>
                    if user
                        phone_number = user.phone
                        if vehicle_type
                            data = 
                                vehicle_type: vehicle_type
                                user_id: user.id
                                createdate: createdate
                            wagner.get('RequestsManager').findCustomRequestIdByData(data).then (request) =>
                                if request
                                    request_id = request.id
                                    @wagner.get('BranchIOManager').getCreditAppLink(request_id).then (url) =>
                                        # update_data = {}
                                        # update_data['request_id'] = request_id
                                        # update_data['universal_deeplink'] = url
                                        # wagner.get('HubspotManager').updateHubspotDealDetail(deal_id, update_data).then (result) =>
                                        #     zap_data =
                                        #         name: fullname
                                        #         email: email
                                        #         phone_number: phone_number
                                        #         request_id: request_id
                                        #         deep_link: url
                                        #         year: ''
                                        #         brand: make
                                        #         model: ''
                                        #         trim: ''
                                        #         created_at: moment(request.request_made_at, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mmA')
                                        #     console.log zap_data
                                        #     wagner.get('ZapierManager').generateRequestLink(zap_data).then (result) =>
                                        #         console.log 'success'
                                        #         UpdateFunciton(pos + 1)
                                else 
                                    UpdateFunciton(pos + 1)
                        else
                            data = 
                                make: make
                                model: model
                                trim: trim
                                user_id: user.id
                                createdate: createdate
                            
                            wagner.get('RequestsManager').findRequestIdByData(data).then (request) =>
                                if request
                                    request_id = request.id
                                    year = JSON.parse request?.Vehicle?.Model?.year
                                    @wagner.get('BranchIOManager').getCreditAppLink(request_id).then (url) =>
                                        # update_data = {}
                                        # update_data['request_id'] = request_id
                                        # update_data['universal_deeplink'] = url
                                        # wagner.get('HubspotManager').updateHubspotDealDetail(deal_id, update_data).then (result) =>
                                        #     zap_data =
                                        #         name: fullname
                                        #         email: email
                                        #         phone_number: phone_number
                                        #         request_id: request_id
                                        #         deep_link: url
                                        #         year: year
                                        #         brand: make
                                        #         model: model
                                        #         trim: trim
                                        #         created_at: moment(request.request_made_at, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mmA')
                                        #     console.log zap_data
                                        #     wagner.get('ZapierManager').generateRequestLink(zap_data).then (result) =>
                                        #         console.log 'success'
                                        #         UpdateFunciton(pos + 1)
                                else 
                                    UpdateFunciton(pos + 1)
                    else
                        UpdateFunciton(pos + 1)
            ).catch (error) =>
                console.log error
    UpdateFunciton(1)
).catch (error)=>
    console.log error
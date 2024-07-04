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

wagner.factory 'Raven', () ->
    return Raven


###
# Job to update deeplink and year for Hubspot Contact
# @param
# @return
###

wagner.get('CreditApplicationManager').getLatestCreditApp().then((credit_apps) =>
    UpdateFunciton=(pos) ->
        if pos == credit_apps.length
            process.exit()
        else
            credit_app = credit_apps[pos]
            user_id = credit_app['user_id']
            request_id = credit_app['vehicle_request_id']
            # @wagner.get('UserManager').getUserById(user_id).then (user) =>
            #     email = user.email_address
            #     console.log email
            #     @wagner.get('HubspotManager').getHubspotContact(email).then (contact) =>
            #         # Generate Branch.IO link from request id
            #         @wagner.get('BranchIOManager').getCreditAppLink(request_id).then (url) =>
            #             update_data = 
            #                 request_id: request_id
            #                 universal_url: url
            #                 name: user.first_name
            #                 lastname: user.last_name
            #                 phone: user.phone
            #                 city: user.city
            #                 state: user.state
            #                 zip: user.zip

            #             # Generate Hubspot Contact Property with ID and data
            #             @wagner.get('HubspotManager').updateHubspotContactById(contact.id, update_data, false).then (result)=>
            #                 console.log 'success'
            #                 UpdateFunciton(pos + 1)    
            #             .catch (error) =>
            #                 console.log error
            #         .catch (error) =>
            #             console.log error
            #     .catch (error) =>
            #         console.log error
            # .catch (error) =>
            #     console.log error
    UpdateFunciton(1)
).catch (error)=>
    console.log error
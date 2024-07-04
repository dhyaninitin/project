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

wagner.get('UserManager').fetchAllConEmails().then (users) ->
    handle=(pos) ->
        if pos == users.length
            process.exit()
        else
            user = users[pos]
            console.log "User Email: ", user.email_address
            email_address = user.email_address.replace('.con', '.com')
            if !user.first_name
                user.update({
                    email_address: email_address
                })
                handle(pos+1)
            else
                user.update({
                    email_address: email_address
                })
                data = 
                    email: email_address
                    name: user.first_name
                    lastname: user.last_name
                    phone: user.phone
                    city: user.city
                    state: user.state
                    zip: user.zip
                wagner.get('HubspotManager').createContact(data, false).then((result) =>
                    console.log 'success'
                    handle(pos+1)
                ).catch (err)=>
                    console.log err.stack
                    handle(pos+1)
    handle(0)
.catch (error)=>
    console.log error
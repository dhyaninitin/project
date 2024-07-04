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

wagner.get('CPortaluserManager').userPortalLiveLogin().then (result) ->
    if result && result.access_token 
         process.exit()
    else
    wagner.get('EmailTransport').serverDownEmail('changl@gmail.com','hardik.thinktank@gmail.com')
    console.log 'Mail successfully sent'
.catch (error)=>
    console.log error
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

userQuery = "select max(id) as id, email_address from user where email_address in (select email_address from user where phone is not null and trim(phone) <> '' group by email_address having count(*) > 1) and (phone is not null and trim(phone) <> '') group by email_address"

sequelize.query(userQuery, { type: sequelize.QueryTypes.SELECT}).then (users) ->
    UpdatePhone=(pos) ->
        if pos == users.length
            process.exit()
        else
            user = users[pos]
            user_id = user.id
            user_email = user.email_address
            console.log "Updating Email: " + user_email
            wagner.get('UserManager').getUserById(user_id).then (user_info)=>
                phone = user_info.phone
                wagner.get('UserManager').updateProfileByEmail(user_email, { phone: phone })
                UpdatePhone(pos+1)
            .catch (error)=>
                console.log 'failed: ' + error.message
    UpdatePhone(0)
.catch (error)=>
    console.log error
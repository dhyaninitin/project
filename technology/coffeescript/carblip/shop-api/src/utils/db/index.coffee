#Initialize Sequelize
Sequelize = require('sequelize')
config = require('../../config')
dbconfig=config.db


module.exports =  (wagner) ->
    # Turn on debugging for sequelize when we are using debug log level
    # dbconfig.logging = wagner.get("logger").debug
    dbconfig.logging = true
    return new Sequelize dbconfig.database, dbconfig.username, dbconfig.password, dbconfig.options

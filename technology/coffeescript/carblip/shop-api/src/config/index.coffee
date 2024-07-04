env = process.env.NODE_ENV; 
localhost = require('./localhost')
staging = require('./staging')
prod = require('./prod')
dev = require('./dev')

config = 
 localhost: localhost
 staging: staging
 prod: prod,
 development: dev

module.exports = config[env];
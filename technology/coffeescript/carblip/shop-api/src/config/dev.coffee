_ = require 'underscore'
baseConfig = require('./base')

module.exports = _.extend _.clone(baseConfig), {
    "log_level": "trace",
    "sslEnabled": true,
    "apiUrl": "https://api-shop-dev.carblip.com",
    "SENTRY": {
        "dsn": "dsnLink",
        "environment": "staging",
        "serverName": "staging",
        "sendTimeout": 5
    },
    "mandrill": {
        "apikey": process.env.MANDRILL_API_KEY,
        "fromEmail": "supports@carblip.com",
        "formName": "CarBlip Customer Service",
        "backup_lead_emails": "test@carblip.com"
    },
    "carsdirect": {
      "url": "https://api-staging.carblip.com/api/lead",
      "accessToken": process.env.CARS_DIRECT_TOKEN,
    },
    "carsdirectCB3": {
        "url": "https://api-staging.carblip.com/api/leadCBThree",
        "accessToken": process.env.CARS_DIRECT_TOKEN_CB3,
    },
    "testEmail": "krum@carblip.com",
}
_ = require 'underscore'
baseConfig = require('./base')

module.exports = _.extend _.clone(baseConfig), {
    "log_level": "trace",
    "sslEnabled": true,
    "apiUrl": "https://api.Automotive.com",
    "SENTRY": {
        "dsn": "",
        "environment": "staging",
        "serverName": "staging",
        "sendTimeout": 5
    },
    "mandrill": {
        "apikey": process.env.MANDRILL_API_KEY,
        "fromEmail": "support@Automotive.com",
        "formName": "Automotive Customer Service",
        "backup_lead_emails": "test@Automotive.com"
    },
    "carsdirect": {
      "url": "https://api.Automotive.com/api/lead",
      "accessToken": process.env.CARS_DIRECT_TOKEN,
    },
    "carsdirectCB3": {
        "url": "https://api.Automotive.com/api/leadCBThree",
        "accessToken": process.env.CARS_DIRECT_TOKEN_CB3,
    },
    "testEmail": "test@Automotive.com",
}
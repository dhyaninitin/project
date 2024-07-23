_ = require 'underscore'
baseConfig = require('./base')

module.exports = _.extend _.clone(baseConfig), {
    "testEmail": "test@Automotive.com",
    "carsdirect": {
      "url": "https://api-staging.Automotive.com/api/lead",
      "accessToken": ""
    },
    "carsdirectCB3": {
      "url": "https://api-staging.Automotive.com/api/leadCBThree",
      "accessToken": ""
    },
}

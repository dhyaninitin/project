_ = require 'underscore'
baseConfig = require('./base')

module.exports = _.extend _.clone(baseConfig), {
    "testEmail": "krum@carblip.com",
    "carsdirect": {
      "url": "https://api-staging.carblip.com/api/lead",
      "accessToken": "HYDUgyasgdasydugasdastfvaTT"
    },
    "carsdirectCB3": {
      "url": "https://api-staging.carblip.com/api/leadCBThree",
      "accessToken": "HYDUgyasgdasydugasdastfvaTT"
    },
}

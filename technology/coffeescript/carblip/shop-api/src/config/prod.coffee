_ = require 'underscore'
baseConfig = require('./base')

module.exports = _.extend _.clone(baseConfig), {
  "log_level": "trace",
  "sslEnabled":true,
  "apiUrl": "https://api-shop.carblip.com",
  "webUrl": "https://shop.carblip.com",
  "shopUrl": "https://shop.carblip.com/lease",
  "logoUrl": "https://shop.carblip.com/assets/img/logo/carblip-logo-OG-web.png",
  "SENTRY": {
    "dsn": "https://5ba51de7036240c188ca6af97d9b7d0d@sentry.io/1793155",
    "environment": "production",
    "serverName": "production",
    "sendTimeout": 5
  },
  "SEGMENT": {
    "api_key": "Lde6U1tQ73pzMoR4JP49aFMPrHCFHYEn",
    "app_name": "carblip-app"
  }
  "APPSFLYER": {
    "devkey": "ZVPpdkVrnZQy85jrrHNDrU",
    "appid": "id1362042544"
  },
  "loggly": {
    "credentials": {
      "token": "7ad1707c-f8f5-46f0-8664-7145f1d8913a",
      "subdomain": "carblip",
      "tags": [
          "carblip-prod"
      ]
    },
    "bufferLength": 20,
    "bufferTimeout": 300000
  },
  "google":{
    "auth_redirect_url": "https://api-shop.carblip.com/google-auth",
    "folder_id": "15xiXjq97XqZioSu6FGbvsgxLq2G847Ah",
    "radius": 20
  },
  "facebook": {
    "appId": "1884838051844622",
    "appSecret": "2f7dd17d6bcfb3730e215390860e8590",
    "callbackURL": "http://carblip.com/auth/facebook/callback",
    "scope":["email","user_about_me","user_birthday","user_education_history","user_hometown","user_location","user_work_history"]
  },
  "mandrill": {
    "apikey": process.env.MANDRILL_API_KEY,
    "fromEmail":"support@carblip.com",
    "formName": "CarBlip Customer Service",
    "backup_lead_emails": "chang@carblip.com, brian@carblip.com"
  },
  "branch_io": {
    "appId": "510722748272627810",
    "key": "key_live_poC4lyCJEZbXIRiLf6CzUaimzrbayMaU",
    "secret": "secret_live_OQUZp4op6Gi4WcSWSvdquFvVDx4VJiKK"
  },
  "carsdirect": {
    "url": "https://api.carblip.com/api/lead",
    "accessToken": process.env.CARS_DIRECT_TOKEN
  },
  "carsdirectCB3": {
    "url": "https://api-staging.carblip.com/api/leadCBThree",
    "accessToken": process.env.CARS_DIRECT_TOKEN_CB3,
  },
}
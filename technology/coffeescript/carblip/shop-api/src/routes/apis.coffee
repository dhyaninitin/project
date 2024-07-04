HTTPStatus = require('http-status')
config = require('../config')
moment = require('moment-timezone')
ceil = require('math-ceil')
math = require('mathjs')
randomstring = require('randomstring')
fs = require('fs')
base64 = require('base-64')
async = require('async')
zipcodes = require('zipcodes')
UA = require("urban-airship")
_ = require('lodash')
ChromeDataHelpers = require('../utils/ChromeDataHelpers');
helpers = require('../utils/helper');
constants = require('../core/constants');
{ check, validationResult } = require('express-validator/check')
CryptoJS = require("crypto-js");
rateLimit = require("express-rate-limit");
requestLib = require('request');
convert = require('xml-js');
Slack = require 'node-slackr'
slack = new Slack('https://hooks.slack.com/services/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',
    channel: '#alerts'
    username: 'Bounced Back Lead'
    icon_emoji: ':x:'
)
# convert = require('xml-js');
module.exports = (app, wagner, checkAuthenticated) ->

  # Deal details from hubspot
  DealUser = {}
  DealInventory = {}
  DealOffer = {}

  ###
  Dealer are associated with primary dealer
  So if primary dealer exists, find and reutrn primary dealer
  ###
  checkAndFindPrimaryDealer = (dealer) ->
    return new Promise (resolve, reject) =>
      if dealer['dealer_primary']
        wagner.get('VehicleInventoryManager').fetchDealerById(dealer['dealer_primary']).then (dealer)=>
          resolve dealer
        .catch (error) =>
          reject error
      else
        resolve dealer
  
  app.post '/apis/test', (req, res) ->
    wagner.get('BranchIOManager').getLink().then((result) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
        data: result
    ).catch (e) ->
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: e.stack

  app.post '/apis/refreshDealstage', (req, res) ->
    wagner.get('HubspotManager').fetchDealStages().then (dealsPipelines) ->
      console.log "Fetching for DealStage: count - ", dealsPipelines.length
      # dealStages = helpers.formatDealStage(dealStages)
      wagner.get('DealStageManager').upsertItems(dealsPipelines).then (result) ->
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
    .catch (e)=>
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: e.stack

  app.get '/heartland-webhook', checkAuthenticated.isWebhook, [
    check('requestid')
      .isLength({min:1})
      .withMessage('requestid is required'),
  ],(req, res) ->

    rquestId = req.query.requestid || req.body.requestid
    wagner.get('RequestsManager').getRequestById(rquestId).then((vehicleRequest) ->
      if not vehicleRequest
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: 'RequestId is invalid'

      dealId = vehicleRequest.deal_id
      if not dealId
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: 'DealID is invalid'

      param = {}
      param['deposit_required_'] = 'Paid'
      # wagner.get('HubspotManager').updateHubspotDealDetail(dealId, param).then((result) ->
      #   res.status(HTTPStatus.OK).json
      #     success:'1'
      #     message: "success"
      # )
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
    ).catch (e) ->
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: e.stack

  app.post '/apis/updateUserHubspot', checkAuthenticated.isWebhook, [
  ], (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    options =
      first_name: req.body.properties?.firstname?.value
      last_name: req.body.properties?.lastname?.value
      email_address: req.body.properties?.email?.value
      hubspot_owner_id: req.body.properties?.hubspot_owner_id?.value
      phone: helpers.formatPhoneNumber(req.body.properties?.phone?.value)

    wagner.get('UserManager').updateFromHubspot(options).then((result) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
    ).catch (e) ->
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: e.stack

  app.post '/apis/onChangeDealStatusHubspot', checkAuthenticated.isWebhook, [
    check('objectId')
      .isLength({min:1})
      .withMessage('objectId is required'),
  ], (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    deal_id = req.body.objectId

    wagner.get('RequestsManager').getRequestByDealId(deal_id).then((request) ->
      user = null
      if request
        user = request.User
        @analytics = @wagner.get('analytics')
        @analytics.identify("#{user.id}", {
          firstName: user.first_name,
          lastName: user.last_name
        })

        eventName= 'sale_success'
        eventProperties = 
          request_id: request.id,
          deal_id: deal_id

        @analytics.track(eventName, eventProperties)

      if user and user.appsflyer_id
        now = moment().format('YYYY-MM-DD HH:mm:ss.Z')
        options = 
          method: 'POST',
          url: 'https://api2.appsflyer.com/inappevent/' + config.APPSFLYER.appid,
          headers:  
            "authentication": config.APPSFLYER.devkey,
            'Content-Type': 'application/json' 
          body: 
            appsflyer_id: user.appsflyer_id,
            eventName: eventName,
            eventValue: JSON.stringify(eventProperties),
            eventTime: now
          json: true

        requestLib options, (error, response, body) =>
          console.log(body)
          if error
            throw error
          else
            res.status(HTTPStatus.OK).json
              success:'1'
              message: "success"
      else
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "no appsflyer id"
    ).catch (e) ->
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: e.stack

  app.get '/apis/getBrandsByYear', (req, res) ->
    payload=
      year: req.body.year
    # fetch all brands
    wagner.get('BrandsManager').fetchBrandsByYear(payload).then((brands) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
        data: brands
    ).catch (e) ->
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']

  app.get '/apis/getModelByBrandYear', (req, res) ->
    wagner.get('BrandsManager').defaultYear().then (result) =>
      year = req.body.year || result[0].year
      payload=
        id: req.body.brand_id
        year: year
      # fetch models for a brand
      wagner.get('BrandsManager').fetchModelsByYearBrand(payload).then (models)=>
        res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: models
      .catch (error)=>
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.NOT_FOUND).json
            success:'0'
            message: constants.error_messages['SomethingWrong']
    .catch (error)=>
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.NOT_FOUND).json
            success:'0'
            message: constants.error_messages['SomethingWrong']

  app.get '/apis/getBrands', (req, res) ->
    # fetch all brands
    wagner.get('BrandsManager').fetchAllBrands(true).then((brands) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
        data: brands
    ).catch (e) ->
      console.log("Errr",e)
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']

  app.post '/apis/getModelYears', (req, res) ->
    payload=
      id: req.body.brand_id
    # fetch models for a brand
    wagner.get('BrandsManager').fetchModelsYearsByBrandId(payload).then (data)=>
      if data? && data.length
        res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: data
      else
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: constants.error_messages['SomethingWrong']
    .catch (error)=>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: constants.error_messages['SomethingWrong']

  app.post '/apis/getModelYearsV1', (req, res) ->
    payload=
      id: req.body.brand_id
    # fetch models for a brand
    wagner.get('BrandsManager').fetchModelsYearsByBrandIdV1(payload).then (data)=>
      if data? && data.length
        res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: data
      else
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: constants.error_messages['SomethingWrong']
    .catch (error)=>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          message: constants.error_messages['SomethingWrong']

  app.post '/apis/getModels', (req, res) ->
    payload=
      id: req.body.brand_id
      year: req.body.year
    # fetch models for a brand
    wagner.get('BrandsManager').fetchModelsByBrandId(payload).then (models)=>
      if models? and models.Models? and models.Models.length
        result = _.map models.Models, (item) =>
          helpers.formatModelData(item)
        res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: result
      else
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          type: 'model_not_found'
          message: constants.error_messages['SomethingWrong']
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.NOT_FOUND).json
        success:'0'
        message: constants.error_messages['SomethingWrong']
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.NOT_FOUND).json
        success:'0'
        message: constants.error_messages['SomethingWrong']

  app.post '/apis/getColour/', (req, res) ->
    payload=
      models:req.body.models
      zip:req.body.zip
    # fetch all vehicles for a model
    wagner.get('VehicleInventoryManager').fetchVehicleColorsByModels(payload).then (result)=>
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: result
    .catch (error)=>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

  # app.get '/apis/applyFilters', checkAuthenticated.isLoggedIn, (req, res) ->
  #   wagner.get('VehicleManager').applySearchFilters(req.query).then((vehicles) ->
  #     res.status(HTTPStatus.OK).json
  #       success:'1'
  #       message: "success"
  #       data: vehicles
  #   ).catch (e) ->
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success:'0'
  #       message: constants.error_messages['Default']

  # app.get '/apis/user_preferences', (req, res) ->
  #   res.sendFile( __dirname + '/user_pref.json')

  # app.post '/apis/search_results/', (req, res) ->
  #   if req.body.models.length>0
  #     payload=
  #         models:req.body.models
  #         zip:req.body.zip
  #         min_price:req.body.min_price
  #         max_price:req.body.max_price
  #         user_id:req.body.user_id
  #     color_codes=new Array
  #     if req.body.color_codes
  #       color_codes=
  #         req.body.color_codes
  #     year=new Array
  #     if req.body.year
  #       year=
  #         req.body.year
  #     page=1
  #     if req.body.page
  #       page= req.body.page
  #     itemsPerPage=config.search_params.records_per_page
  #     offset = (page - 1) * itemsPerPage
  #     wagner.get('VehicleManager').searchResults(payload,color_codes,year,offset,itemsPerPage).then (result)=>
  #         totalPages = ceil(result.length/itemsPerPage)
  #         res.status(HTTPStatus.OK).json
  #            success:'1'
  #            message: "success"
  #            totalPages: totalPages
  #            data:result
  #     .catch (error) =>
  #         console.log error
  #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #            success:'0'
  #            message: constants.error_messages['Default']
  #   else
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #        totalPages: 0
  #        data: new Array

  # app.post '/apis/inventory_search', (req, res) ->
  #   if req.body.models.length>0
  #     # user_id is passed to know if an inventory is added as favorite by a user
  #     payload=
  #         models: req.body.models
  #         zip: req.body.zip
  #         min_price: req.body.min_price
  #         max_price: req.body.max_price
  #         user_id: req.body.user_id
  #         unique: req.body.unique
  #         sold: 0
  #     year=new Array
  #     if req.body.year
  #       year=
  #         req.body.year
  #     page=1
  #     if req.body.page
  #       page= req.body.page
  #     itemsPerPage=config.search_params.records_per_page
  #     offset = (page - 1) * itemsPerPage
  #     # search inventory according to the parameters passed
  #     wagner.get('VehicleManager').inventorySearch(payload,year,offset,itemsPerPage).then (result)=>
  #         totalPages = ceil(result.length/itemsPerPage)
  #         res.status(HTTPStatus.OK).json
  #            success:'1'
  #            message: "success"
  #            totalPages: totalPages
  #            data:result
  #     .catch (error) =>
  #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #            success:'0'
  #            message: constants.error_messages['Default']
  #   else
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #        totalPages: 0
  #        data: new Array

  # app.get '/apis/getRecommendedCars/:cat_id', (req, res) ->
  #   options=
  #     min_price: req.query.min_price
  #     max_price: req.query.max_price
  #     zip: req.query.zip

  #   if options.zip
  #     wagner.get('ModelManager').fetchCategoryModels(req.params.cat_id,options).then((models) ->
  #       res.status(HTTPStatus.OK).json
  #         success: '1'
  #         message: 'success'
  #         data: models
  #     ).catch (e) ->
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         message: constants.error_messages['Default']
  #   else
  #     wagner.get('ModelManager').fetchRecommended(req.params.cat_id,options).then((models) ->
  #       res.status(HTTPStatus.OK).json
  #         success: '1'
  #         message: 'success'
  #         data: models
  #     ).catch (e) ->
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         message: constants.error_messages['Default']

  # app.get '/apis/getCategoryList', (req, res) ->
  #   wagner.get('ModelManager')
  #     .fetchCategories()
  #     .then (categories) ->
  #       brandCategory =
  #         "id": 0
  #         "name": "By Brand"
  #         "description": "Shop by your preferred brand and then select your model."
  #         "image_url": "/public/images/categories/brand.png"
  #         "image_url2": "/public/images/categories/brand2.png"
  #       categories.unshift brandCategory
  #       res.status(HTTPStatus.OK).json
  #         success: '1'
  #         message: "success"
  #         data: categories
  #     .catch (e) ->
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         message: constants.error_messages['Default']
  #         error: e.stack

  # app.get '/apis/getCategories', (req, res) ->
  #   # exclude zip code
  #   brandOptions =
  #     min_price: req.query.min_price
  #     max_price: req.query.max_price
  #   # fetch total inventory count
  #   wagner.get('VehicleInventoryManager').getInventoryCount(brandOptions).then((vehicle_count) ->
  #     # fetch vehicles in categories
  #     wagner.get('ModelManager').fetchCategoriesVehicles(req.query).then((categories) ->
  #       options=
  #         "id": 0
  #         "name": "By Brand"
  #         "description": "Shop by your preferred brand and then select your model."
  #         "image_url": "/public/images/categories/brand.png"
  #         "vehicle_count": vehicle_count
  #       # inserting options into start of categories array
  #       categories.unshift options
  #       res.status(HTTPStatus.OK).json
  #         success:'1'
  #         message: "success"
  #         data: categories
  #     ).catch (e) ->
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success:'0'
  #         message: constants.error_messages['Default']
  #         error: e
  #   ).catch (e) ->
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success:'0'
  #       message: constants.error_messages['Default']
  #       error: e

  # app.post '/apis/saveUserAction/', checkAuthenticated.isLoggedIn, (req, res) ->
  #   payload=
  #       vehicle_inventory_id:req.body.vehicle_inventory_id
  #       user_id:req.body.user_id
  #       favorite:req.body.favorite
  #   # save inventory as favorite or remove inventory from favorites
  #   wagner.get('ModelManager').saveUserAction(payload).then (result)=>
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.post '/apis/saveUserLease', checkAuthenticated.isLoggedIn, (req, res) ->
  #   payload= req.body
  #   payload.token = req.header('token')
  #   wagner.get('VehicleInventoryManager').saveUserLease(payload).then (result)=>
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.get '/apis/getUserFavorites/:user_id', (req, res) ->
  #   page=1
  #   if req.query.page
  #     page= req.query.page
  #   itemsPerPage=config.search_params.records_per_page
  #   offset = (page - 1) * itemsPerPage
  #   # fetch favorites of a user
  #   wagner.get('ModelManager').fetchUserFavorites(req.params.user_id,offset,itemsPerPage).then((favorites) ->
  #     totalPages = ceil(favorites.length/itemsPerPage)
  #     res.status(HTTPStatus.OK).json
  #       success:'1'
  #       message: "success"
  #       totalPages: totalPages
  #       data: favorites
  #   ).catch (e) ->
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success:'0'
  #       message: constants.error_messages['Default']
  #       error: e

  # app.get '/apis/search', (req, res) ->
  #   # Throw exception if api-key is not passed
  #   if !req.header('api-key')
  #     return res.status(401).json(message: 'Please make sure your request has an api-key header')
  #   if req.header('api-key') != config.searchapi.apikey
  #     return res.status(401).json(message: 'Invalid apikey')
  #   if req.query.search.length
  #     wagner.get('ModelManager').fetchModelsFromSearch(req.query.search).then (models)=>
  #       results = _.uniqBy models, 'id'
  #       res.status(HTTPStatus.OK).json
  #         success: '1'
  #         message: 'success'
  #         data: results
  #     .catch (error)=>
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         message: constants.error_messages['Default']
  #         error: error.stack
  #   else
  #     res.status(HTTPStatus.OK).json
  #       success: '1'
  #       message: 'success'
  #       data: new Array

  app.get '/apis/emailExists/:email', (req, res) ->
    # check if email exists
    wagner.get('UserManager').emailExists({"email_address": req.params.email}).then((user) ->
      if user
        if user.phone
          wagner.get('UserManager').sendSMS(user.id, user.phone).then (result)=>
            res.status(HTTPStatus.OK).json
              success:'1'
              message: "success"
              exists: !!user
              user_id: user.id
              lastFour: user.phone.slice(-4)
              phone: user.phone
              first_name: if user then user.first_name else ''
              lease_captured: if user then user.lease_captured else 0
          .catch (error) =>
            if error.status == 400
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success: '0'
                case: 3
                message: constants.error_messages['InvalidPhoneNumber']
            else if _.has(error, 'type')
              message = constants.error_messages['InvalidPhoneNumber']
              if error.type == 2
                message = constants.error_messages['InvalidMobilePhoneNumber']
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success: '0'
                case: 3
                message: message
            else
              throw error
        else
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            exists: !!user
            user_id: user.id
            lastFour: ""
            first_name: if user then user.first_name else ''
            lease_captured: if user then user.lease_captured else 0
      else
        res.status(HTTPStatus.OK).json
          success: "1"
          message: "Email not found"
          exists: !!user
    ).catch (e) ->
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']

  # app.post '/apis/fbLogin/', (req, res) ->
  #   payload=
  #     first_name: req.body.first_name
  #     last_name: req.body.last_name
  #     email_address: req.body.email_address
  #     phone: req.body.phone
  #     device_token: req.body.device_token
  #     device_type: req.body.device_type
  #     facebook_id: req.body.facebook_id
  #     status: 1
  #   # upsert user
  #   wagner.get('UserManager').upsertUser(payload).then (user)=>
  #     # create user session
  #     wagner.get('UserManager').createSession(user).then (result)=>
  #       res.status(HTTPStatus.OK).json
  #          success:'1'
  #          message: "success"
  #          result: result.user_session
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.post '/apis/login', wagner.get('passport').authenticate('apiLogin', session: false), (req, res) ->
  #   wagner.get('UserManager').updateDeviceToken(req.user.user_id, req.body.device_token).then (up_user)=>
  #     res.status(HTTPStatus.OK).json
  #         success:'1'
  #         message: "success"
  #         data: req.user

  app.post '/apis/updateDeviceToken', (req, res) ->
    wagner.get('UserManager').updateDeviceToken(req.body.user_id, req.body.device_token).then (up_user)=>
      res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"

  # app.post '/apis/emailLogin', (req, res) ->
  #   verify_code = randomstring.generate(4).toLowerCase()
  #   options=
  #     email_address: req.body.email
  #     login_verify_code: verify_code
  #   # check if user exists
  #   wagner.get('UserManager').checkUserExists(options.email_address).then (user)=>
  #     fallbackUrl = 'http://'+req.headers.host+'/loginVerification/'+base64.encode(verify_code)
  #     # get deep link code for redirecting link to open in app
  #     wagner.get('Deeplinker').getDeepLink(options.email_address,fallbackUrl,verify_code).then (link)=>
  #       # send email with login confirmation code
  #       wagner.get('EmailTransport').loginConfirmationEmail(req.headers.host,options,link.url)
  #       # update verification code
  #       wagner.get('UserManager').updateVerifyCode(options).then (result)=>
  #         if result
  #           res.status(HTTPStatus.OK).json
  #               success:'1'
  #               message: "Passcode for login sent on email address"
  #       .catch (error) =>
  #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #             success:'0'
  #             message: constants.error_messages['Default']
  #             error: error

  # app.post '/apis/register', wagner.get('passport').authenticate('apiRegister', session: false), (req, res) ->
  #   res.status(HTTPStatus.OK).json
  #       success:'1'
  #       message: "success"
  #       data: req.user

  # app.post '/apis/forgotPassword/', (req, res) ->
  #   # check if user exists
  #   wagner.get('UserManager').userExits(req.body.email,req.headers.host).then (result)=>
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #        result: result
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.post '/apis/submitOffer/', (req, res) ->
  #   options=
  #     vehicle_inventory_id: req.body.vehicle_inventory_id
  #     user_id: req.body.user_id
  #     last_offered_price: req.body.price
  #     last_offer_made_at: moment().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
  #     status: 0
  #   query=
  #     where:
  #       vehicle_inventory_id: req.body.vehicle_inventory_id
  #       user_id: req.body.user_id
  #       is_deleted: 0
  #     defaults: options
  #   # create offer
  #   wagner.get('VehicleInventoryManager').createOffer(query).then (result)=>
  #     options.vehicle_offer_id= result.id
  #     # get last conversation of an offer
  #     wagner.get('VehicleInventoryManager').getLastOfferConversation(options).then (offer)=>
  #       if offer
  #         if offer.offered_by != 'user'
  #           options.price = req.body.price
  #           options.offered_by = req.body.type
  #         else
  #           res.status(HTTPStatus.OK).json
  #             success:'0'
  #             message: "Please wait for response"
  #           return false;
  #       else
  #         options.status = 0
  #         options.price = req.body.price
  #         options.offered_by = req.body.type
  #       # create offer conversation
  #       wagner.get('VehicleInventoryManager').createOfferConversation(options).then (record)=>
  #         options.last_offer_made_at = moment(record.created_at).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
  #         inventoryObj=
  #           offerId: result.id

  #         # send data to sqs
  #         wagner.get('SQSTransport').sendMessage JSON.stringify(inventoryObj), 'counter_offer_processor', 300,(error,msg)=>
  #           wagner.get('VehicleInventoryManager').updateOfferStatus(options).then (updated)=>
  #             res.status(HTTPStatus.OK).json
  #               success:'1'
  #               message: "success"
  #               result: result
  #           .catch (error) =>
  #             res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #               success:'0'
  #               message: constants.error_messages['Default']
  #               error: error

  # app.post '/apis/getMultipleOffers', (req, res) ->
  #   options=
  #     vehicle_inventory_id: req.body.vehicle_inventory_id
  #     user_id: req.body.user_id
  #     last_offered_price: req.body.price
  #     last_offer_made_at: moment().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
  #     status: 0
  #   query=
  #     where:
  #       vehicle_inventory_id: req.body.vehicle_inventory_id
  #       user_id: req.body.user_id
  #       is_deleted: 0
  #     defaults: options
  #   # create offer
  #   wagner.get('VehicleInventoryManager').createOffer(query).then (result)=>
  #     options.vehicle_offer_id = result.id
  #     # get last conversation of an offer
  #     wagner.get('VehicleInventoryManager').getLastOfferConversation(options).then (offer)=>
  #       if offer
  #         if offer.offered_by != 'user'
  #           options.price = req.body.price
  #           options.offered_by = req.body.type
  #         else
  #           res.status(HTTPStatus.OK).json
  #             success:'0'
  #             message: "Please wait for response"
  #           return false;
  #       else
  #         options.status = 0
  #         options.price = req.body.price
  #         options.offered_by = req.body.type
  #       # create offer conversation
  #       wagner.get('VehicleInventoryManager').createOfferConversation(options).then (record)=>
  #         options.last_offer_made_at = moment(record.created_at).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss')
  #         inventoryObj=
  #           offerId: result.id

  #         # send data to sqs
  #         wagner.get('SQSTransport').sendMessage JSON.stringify(inventoryObj), 'counter_offer_processor', 300,(error,msg)=>
  #           wagner.get('VehicleInventoryManager').updateOfferStatus(options).then (updated)=>
  #             res.status(HTTPStatus.OK).json
  #               success:'1'
  #               message: "success"
  #               result: result
  #           .catch (error) =>
  #             res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #               success:'0'
  #               message: constants.error_messages['Default']
  #               error: error

  # app.post '/apis/getMultipleOffers', (req, res) ->
  #   options=
  #     vehicle_inventory_id: req.body.vehicle_inventory_id
  #     zip: req.body.zip
  #   delay = 0
  #   wagner.get('VehicleInventoryManager').getSimilarInventories(options).then (inventories)=>
  #     async.each inventories, ((inventory, callback) =>
  #       wagner.get('VehicleInventoryManager').submitOfferOnInventory(inventory, req.body, ++delay).then (offer) =>
  #         callback null, offer
  #       .catch (error) =>
  #         callback error
  #     ),(err, offers) ->
  #       if err
  #           console.log 'Error: ', err
  #           reject(err)
  #       else
  #         res.status(HTTPStatus.OK).json
  #           success: '1'
  #           message: 'success'
  #           result: offers
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success: '0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.get '/apis/getOffers',checkAuthenticated.isLoggedIn, (req, res) ->
  #   page=1
  #   if req.query.page
  #     page= req.query.page
  #   itemsPerPage=config.search_params.records_per_page
  #   offset = (page - 1) * itemsPerPage
  #   # get user offers
  #   wagner.get('VehicleInventoryManager').getUserOffers(req.query,offset,itemsPerPage).then (offers)=>
  #     res.status(HTTPStatus.OK).json
  #       success:'1'
  #       message: "success"
  #       result: offers

  app.get '/apis/userProfile',checkAuthenticated.isLoggedIn, (req, res) ->
    # get user profile by token
    wagner.get('UserManager').getProfile(req.header('token')).then (result)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         result: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error

  # update user profile
  app.post '/apis/userProfile', checkAuthenticated.isLoggedIn, [
    check('first_name')
      .isLength({min:1})
      .withMessage('First Name is required'),
    check('phone')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      )
  ],(req, res) ->

    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    new_phone = helpers.formatPhoneNumber(req.body.phone)
    req.body.phone = new_phone
    
    async.waterfall [
      (callback) =>
        # get user session by token
        wagner.get('UserManager').getToken(req.header('token')).then (user_session)=>
          callback(null, user_session)
        .catch (error) =>
          callback error
      (user_session, callback) =>
        # get user details
        wagner.get('UserManager').findById(user_session.user_id).then (user)=>
          callback(null, user)
        .catch (error) =>
          callback error
      (user, callback) =>
        sendOtp = false
        if not user.phone_verified or (new_phone and user.phone != new_phone)
          sendOtp = true

        options = 
          first_name: req.body.first_name
        # update user profile
        wagner.get('UserManager').updateProfile(user.id, options).then (result)=>
          # if !sendOtp
          #   contact_info = 
          #     email: user.email_address
          #     name: options.first_name
          #     lastname: user.last_name
          #     phone: user.phone
          #     city: user.city
          #     state: user.state
          #     zip: user.zip
          #   update hubspot contact
          #   wagner.get('HubspotManager').createContactInHubspot(contact_info, false)
          
          # send a email to contact
            
          callback(null, user, sendOtp)
        .catch (error) =>
          callback error
      (user, sendOtp, callback) =>
        if sendOtp
          # send OTP if phone is updated
          wagner.get('UserManager').sendSMS(user.id, new_phone).then (result)=>
            callback(null, user)
          .catch (error) =>
            callback error
        else
          callback null
    ],(error,result)=>
      if error
        if error.status == 400
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success: '0'
            case: 3
            message: constants.error_messages['InvalidPhoneNumber']
        else if _.has(error, 'type')
          message = constants.error_messages['InvalidPhoneNumber']
          if error.type == 2
            message = constants.error_messages['InvalidMobilePhoneNumber']
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success: '0'
            case: 3
            message: message
        else
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success:'0'
            message: constants.error_messages['Default']
            error: error
      else
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"

  # update user appsflyer info
  app.post '/apis/appsflyer', checkAuthenticated.isLoggedIn, [
    check('appsflyer_id')
      .isLength({min:1})
      .withMessage('appsflyer_id is required'),
    check('idfa')
      .isLength({min:1})
      .withMessage('idfa is required'),
  ],(req, res) ->

    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    async.waterfall [
      (callback) =>
        # get user session by token
        wagner.get('UserManager').getToken(req.header('token')).then (user_session)=>
          callback(null, user_session)
        .catch (error) =>
          callback error
      (user_session, callback) =>
        # get user details
        wagner.get('UserManager').findById(user_session.user_id).then (user)=>
          callback(null, user)
        .catch (error) =>
          callback error
      (user, callback) =>
        # get user appsflyer data
        options =
          appsflyer_id: req.body.appsflyer_id
          idfa: req.body.idfa
          idfv: req.body.idfv

        # update user profile
        wagner.get('UserManager').updateProfile(user.id, options).then (result)=>
          callback(null, result)
        .catch (error) =>
          callback error
    ],(error,result)=>
      if error
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          message: constants.error_messages['Default']
          error: error
      else
        res.status(HTTPStatus.OK).json
          success: '1'
          message: "success"

  app.post '/apis/registerPhone',  [
    check('first_name')
      .isLength({min:1})
      .withMessage('First Name is required'),
    check('email_address')
      .isLength({min:1})
      .withMessage('Email is required'),
    check('email_address')
      .custom((email) => 
        if helpers.isEmailInvalid(email)
          return Promise.reject('Email is invalid!')
        return true;
      )
    check('phone')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      )
  ],
  (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })
      
    phone = helpers.formatPhoneNumber(req.body.phone)

    device_type = req.header('User-Agent') || null
    source_utm = null
    if device_type == 'iOS'
      source_utm = 2
    else
      source_utm = 1

    payload=
      first_name: req.body.first_name && req.body.first_name.trim() || ''
      last_name: req.body.last_name && req.body.last_name || ''
      email_address: req.body.email_address && req.body.email_address.trim() || ''
      device_token: req.body.device_token && req.body.device_token.trim() || ''
      device_type: device_type
      source: source_utm

    wagner.get('MailchimpManager').patchUser(_.extend payload, {phone: phone})

    # upsert phone user
    wagner.get('UserManager').emailExists(payload).then (isUserExists)=>
      if !isUserExists
        payload = _.extend payload, {phone: phone}
      wagner.get('UserManager').phoneUser(payload).then (user)=>
        # hubspotUser = 
        #   name: user.first_name
        #   last_name: user.last_name
        #   email: user.email_address
        #   phone: user.phone
        #   source: 3
        #   city: user.city
        #   state: user.state
        #   zip: user.zip
        # wagner.get('HubspotManager').createContactInHubspot(hubspotUser, false)
        wagner.get('UserManager').sendSMS(user.id, phone).then (result)=>
          if user
            res.status(HTTPStatus.OK).json
                success:'1'
                message: "OTP sent on the phone number"
                result:
                  is_new_user: !isUserExists
                  user_id: user.id
        .catch (error) =>
          if error.status == 400
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: constants.error_messages['InvalidPhoneNumber']
          else if _.has(error, 'type')
            message = constants.error_messages['InvalidPhoneNumber']
            if error.type == 2
              message = constants.error_messages['InvalidMobilePhoneNumber']
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: message
          else
            throw error
      .catch (error) =>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
          error: error.stack

  app.post '/apis/verifyLoginOTP', checkAuthenticated.isUserActive, [
    check('first_name')
      .isLength({min:1})
      .withMessage('First Name is required'),
    check('otp')
      .isLength({min:1})
      .withMessage('OTP is required'),
    check('phone')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      )
  ],(req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    phone = helpers.formatPhoneNumber(req.body.phone)
    user_agent = req.header('User-Agent') || null
    source_utm = null
    if user_agent == 'iOS'
      source_utm = 2
    else
      source_utm = 1

    query=
      where:
        phone_tmp: phone
        otp_tmp: req.body.otp

    wagner.get('UserManager').checkToken(query).then (user)=>
      if user
        updates =
          phone: phone
          otp: null
          phone_tmp: null
          otp_tmp: null
          phone_verified: 1
          status: 1
          device_token: req.body.device_token
          first_name: req.body.first_name

        wagner.get('User').update(updates, {where: {id: user.id}}).then ()=>
          wagner.get('UserManager').createSession(user).then (result)=>
            user_session = result.user_session
            is_created = result.is_created
            if is_created
              options = 
                first_name: updates.first_name
                email_address: user.email_address
                device_type: user_agent
              # send welcome email
              wagner.get('EmailTransport').welcomeUserEmail(options).then (result) =>
                console.log 'Mail successfully sent'
              .catch (error) =>
                console.log error 

            # contact_info = 
            #   email: user.email_address
            #   name: updates.first_name
            #   lastname: user.last_name
            #   phone: phone
            #   city: user.city
            #   state: user.state
            #   zip: user.zip
            #   source: source_utm
            # create hubspot contact
            # wagner.get('HubspotManager').createContactInHubspot(contact_info, false).then (contactId) =>
            #   console.log 'Hubspot contact successfully created: id: ' + contactId
            # .catch (error) =>
            #   console.log error
            
            res.status(HTTPStatus.OK).json
              success: '1'
              message: 'success'
              result: user_session
      else
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success: '0'
            case: 3
            message: constants.error_messages['InvalidOTP']
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        case: 3
        message: constants.error_messages['InvalidOTP']

  app.post '/apis/sendSMS', [
    check('phone_number')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone_number')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      ),
    checkAuthenticated.isLoggedIn,
  ], (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    new_phone = helpers.formatPhoneNumber(req.body.phone_number)
    token = req.header('token')

    options = 
      phone: new_phone

    wagner.get('UserManager').getProfile(token).then (user)=>
      if user
        wagner.get('UserManager').phoneExists(options).then (phone_user)=>
          if !phone_user || (phone_user && phone_user.id == user.id)
            wagner.get('UserManager').sendSMS(user.id, new_phone).then (result)=>
              res.status(HTTPStatus.OK).json
                success:'1'
                message: "OTP sent"
            .catch (error) =>
              if error.status == 400
                res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                  success: '0'
                  case: 3
                  message: constants.error_messages['InvalidPhoneNumber']
              else if _.has(error, 'type')
                message = constants.error_messages['InvalidPhoneNumber']
                if error.type == 2
                  message = constants.error_messages['InvalidMobilePhoneNumber']
                res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                  success: '0'
                  case: 3
                  message: message
              else
                throw error
          else
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: 'Phone number already existing'
        .catch (error) =>
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success: '0'
            message: constants.error_messages['Default']
            error: error.message
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']
        error: error.message

  app.post '/apis/smsCallback', (req, res) ->

    data = req.body

    # if data['SmsStatus'] == 'undelivered' or data['SmsStatus'] == 'failed' or data['ErrorCode'] == '21610'
    #   wagner.get('PhoneLimitManager').createOrUpdate(data['To'])
    res.status(HTTPStatus.OK).json
      success:'1'
      message: "success"

  ###verifyPhoneLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, # 30 min window
    max: 3, # start blocking after 3 requests
    message:
      "Too many requests from this Phone, Please try again after 30 mins."
    keyGenerator: (req) =>
      return helpers.formatPhoneNumber(req.body.phone)
    onLimitReached: (req, res, options) =>
      ip = req.ip
      wagner.get('ApiLimitManager').increaseCount(ip)
  });###

  app.post '/apis/verifyPhone', checkAuthenticated.isUserActive,[
    check('phone')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      )
  ],(req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    phone = helpers.formatPhoneNumber(req.body.phone)

    device_type = req.header('User-Agent') || null
    payload=
      phone: phone
      device_token: req.body.device_token && req.body.device_token.trim() || ''
      device_type: device_type
    
    datetime = new Date();
    currentDate = new Date(datetime.setDate(datetime.getDate()+1)).toISOString().slice(0,10);
    
    prevDay = new Date();

    object = {
      "currentDate": currentDate,
      "phoneNumber" : req.body.phone,
      "prevDay":  new Date(prevDay.setDate(prevDay.getDate()-1)).toISOString().slice(0,10)
    }
      
    wagner.get('UserManager').phoneExists(payload).then (user)=>
      # signin
      if (user)
        wagner.get('UserManager').sendSMS(user.id, user.phone).then (result)=>
          # wagner.get('PhoneLimitManager').createOrUpdateWithChangesInUpdatedAt(object).then (data) =>
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "OTP sent on the phone number"
            result:
              is_new_user: false
              user:
                first_name: user.first_name
                last_name: user.last_name
        .catch (error) =>
          if error.status == 400
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: constants.error_messages['InvalidPhoneNumber']
          else if _.has(error, 'type')
            message = constants.error_messages['InvalidPhoneNumber']
            if error.type == 2
              message = constants.error_messages['InvalidMobilePhoneNumber']
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: message
          else
            throw error
      else
      # register
        wagner.get('UserManager').createPhoneOtp(payload).then (otp_result)=>
          wagner.get('UserManager').sendSMSOtp(phone, otp_result.otp).then (result)=>
            # wagner.get('PhoneLimitManager').createOrUpdateWithChangesInUpdatedAt(object).then (data) =>
            res.status(HTTPStatus.OK).json
                success:'1'
                message: "OTP sent on the phone number"
                result:
                  is_new_user: true
                  otp_id: otp_result.id
          .catch (error) =>
            if error == 400
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success: '0'
                case: 3
                message: constants.error_messages['InvalidPhoneNumber']
            else if _.has(error, 'type')
              message = constants.error_messages['InvalidPhoneNumber']
              if error.type == 2
                message = constants.error_messages['InvalidMobilePhoneNumber']
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success: '0'
                case: 3
                message: message
            else
              throw error
    .catch (error) =>
      console.log("errr",error)
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']
        error: error.messag

  app.post '/apis/verifyOTP', checkAuthenticated.isUserActive, [
    check('otp')
      .isLength({min:1})
      .withMessage('OTP is required'),
    check('phone')
      .isLength({min:1})
      .withMessage('Phone Number is required'),
    check('phone')
      .custom((phone) => 
        if helpers.isPhoneNumberInvalid(phone) 
          return Promise.reject('Phone Number is invalid')
        return true;
      )
  ],(req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    phone = helpers.formatPhoneNumber(req.body.phone)

    user_agent = req.header('User-Agent') || null

    source_utm = null
    if user_agent == 'iOS'
      source_utm = 2
    else
      source_utm = 1

    is_register = false;
    if req.body.is_register 
      is_register = true;

    options =
        phone: phone
        otp: req.body.otp

    if is_register
      wagner.get('UserManager').checkPhoneOtp(options).then (phone_otp)=>
        updates = 
          is_verified: 1
        if phone_otp
          wagner.get('PhoneOtps').update(updates, {where: {id: phone_otp.id}});
          
          ## reset counter for time limit check
          wagner.get('PhoneLimitManager').resetCounter({ "phoneNumber" : req.body.phone, "count" : 0 });

          res.status(HTTPStatus.OK).json
              success: '1'
              message: 'success'
              result: 
                otp_id: phone_otp.id
        else
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: constants.error_messages['InvalidOTP']
      .catch (error) =>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          case: 3
          message: constants.error_messages['InvalidOTP']
    else
      query=
        where:
          phone_tmp: phone
          otp_tmp: req.body.otp
          
      wagner.get('UserManager').checkToken(query).then (user)=>
        if user
          updates =
            phone: phone
            otp: null
            phone_tmp: null
            otp_tmp: null
            phone_verified: 1
            status: 1
            device_token: req.body.device_token
            appsflyer_id: req.body.appsflyer_id
            idfa: req.body.idfa
            idfv: req.body.idfv

          wagner.get('User').update(updates, {where: {id: user.id}}).then ()=>
            
            ### create register logs in portal ###
            logString = "#{user.first_name} #{user.last_name} was logged in by #{constants.source_utm_list[source_utm]}"
            wagner.get('CPortaluserManager').userLogs({ id:user.id, logString:logString }, 'login', constants.source_utm_list[source_utm], {}).then( 
              (logres)=> console.log "final log res", logres 
              (error)=> console.log error)
            ### create register logs in portal ###
            
            wagner.get('UserManager').createSession(user).then (result)=>
              user_session = result.user_session

              # contact_info = 
              #   email: user.email_address
              #   name: user.first_name
              #   lastname: user.last_name
              #   phone: phone
              #   city: user.city
              #   state: user.state
              #   zip: user.zip
              #   source: source_utm
              # # create hubspot contact
              # wagner.get('HubspotManager').createContactInHubspot(contact_info).then (contactId) =>
              #   console.log 'Hubspot contact successfully created: id: ' + contactId
              # .catch (error) =>
              #   console.log error
              
              ## reset counter for time limit check
              wagner.get('PhoneLimitManager').resetCounter({ "phoneNumber": req.body.phone, "count" : 0 });
              
              res.status(HTTPStatus.OK).json
                success: '1'
                message: 'success'
                result: user_session
        else
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              case: 3
              message: constants.error_messages['InvalidOTP']
      .catch (error) =>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          case: 3
          message: constants.error_messages['InvalidOTP']

  app.post '/apis/registerWithOtpId',  [
    check('first_name')
      .isLength({min:1})
      .withMessage('First Name is required'),
    check('email_address')
      .isLength({min:1})
      .withMessage('Email is required'),
    check('email_address')
      .custom((email) => 
        if helpers.isEmailInvalid(email)
          return Promise.reject('Email is invalid!')
        return true;
      )
    check('otp_id')
      .isLength({min:1})
      .withMessage('Opt Id is required'),
  ],
  (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })
      
    device_type = req.header('User-Agent') || null
    source_utm = null
    if device_type == 'iOS'
      source_utm = 2
    else
      source_utm = 1

    otp_id = req.body.otp_id
    wagner.get('UserManager').findPhoneOtpById(otp_id).then (phone_otp)=>
      if (phone_otp && phone_otp.is_verified)
        phone = helpers.formatPhoneNumber(phone_otp.phone)
        payload=
          first_name: req.body.first_name && req.body.first_name.trim() || ''
          last_name: req.body.last_name && req.body.last_name.trim() || ''
          email_address: req.body.email_address && req.body.email_address.trim() || ''
          zip: req.body.zipcode && req.body.zipcode.trim() || req.body.zip && req.body.zip.trim() || ''
          phone: phone
          status: 1
          source: source_utm
          phone_verified: 1
          device_token: req.body.device_token && req.body.device_token.trim() || ''
          device_type: device_type
          appsflyer_id: req.body.appsflyer_id
          idfa: req.body.idfa
          idfv: req.body.idfv

        # upsert phone user
        wagner.get('UserManager').emailExists(payload).then (emailUser)=>
          # if !emailUser || (emailUser && !emailUser.phone)
          wagner.get('UserManager').phoneUserUpdate(payload, emailUser).then (user)=>
            
            ### create register logs in portal ###
            logString = "#{user.first_name} #{user.last_name} was registered by #{constants.source_utm_list[source_utm]}"
            wagner.get('CPortaluserManager').userLogs({id:user.id, logString:logString}, 'register', constants.source_utm_list[source_utm], {}).then( 
              (logres)=> console.log "final log res", logres 
              (error)=> console.log error)
            ### create register logs in portal ###
            
            wagner.get('UserManager').createSession(user).then (result)=>
              wagner.get('MailchimpManager').patchUser(payload).then (response) =>
                options = 
                  first_name: user.first_name
                  email_address: user.email_address
                  device_type: device_type
                # send welcome email
                wagner.get('EmailTransport').welcomeUserEmail(options).then (responsed) =>
                  console.log 'Mail successfully sent'
                  console.log responsed.body
                .catch (error) =>
                  wagner.get('Raven').captureException(error)
                  console.log error

              user_session = result.user_session

              # contact_info = 
              #   email: user.email_address
              #   name: user.first_name
              #   lastname: user.last_name
              #   phone: phone
              #   city: user.city
              #   state: user.state
              #   zip: user.zip
              #   source: source_utm
              # # create hubspot contact
              # wagner.get('HubspotManager').createContactInHubspot(contact_info).then (contactId) =>
              #   console.log 'Hubspot contact successfully created: id: ' + contactId
              # .catch (error) =>
              #   wagner.get('Raven').captureException(error)
              #   console.error error
              
              res.status(HTTPStatus.OK).json
                success: '1'
                message: 'success'
                result: user_session
            .catch (error) =>
              wagner.get('Raven').captureException(error)
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success:'0'
                message: "Error while sending OTP"
                error: error.stack
          .catch (error) =>
            wagner.get('Raven').captureException(error)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success:'0'
              message: constants.error_messages['Default']
              error: error.stack
          # else
          #   res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          #     success:'0'
          #     message: 'Email already exists'
      else
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: 'Opt_id is invalid'

  app.post '/apis/emailExists',  [
    check('email_address')
      .isLength({min:1})
      .withMessage('Email is required')
    check('email_address')
      .custom((email) => 
        if helpers.isEmailInvalid(email)
          return Promise.reject('Email is invalid!')
        return true;
      )
  ],
  (req, res) ->
    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    options = 
      email_address: req.body.email_address 

    wagner.get('UserManager').emailExists(options).then (user)=>
      if user
        res.status(HTTPStatus.OK).json
          success: '1'
          message: 'success'
      else
        res.status(HTTPStatus.OK).json
          success: '0'
          message: 'Email doesn\'t exist'
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']
        error: error.message

  ###
  Create lead and send email to sales@carblip.com
  Also add not with lead
  ###
  # createLeadAndSendEmail = (companyId, contactId, user, inventory, offer) ->
  #   return new Promise (resolve, reject) =>
  #     wagner.get('HubspotManager').createDeal(companyId, contactId, user, inventory, offer).then (result)=>
  #       if result
  #         console.log "Lead Id: #{result.dealId}"
  #         wagner.get('HubspotManager').createNote(companyId, contactId, result.dealId, user, inventory, offer).then (dealNote)=>
  #           if dealNote
  #             wagner.get('EmailTransport').sendConfirmDealEmail(user, inventory, offer)
  #             resolve "resolve"
  #           else
  #             reject "unable to create deal note"
  #       else
  #         reject "unable to create deal"

  ###
  Create Company and Contact
  ###
  # createCompanyAndContact = (user, inventory, offer) ->
  #   return new Promise (resolve, reject) =>
  #     wagner.get('HubspotManager').createContact(user, inventory, offer).then (contact)=>
  #       if contact
  #         wagner.get('HubspotManager').createCompany(user, inventory, offer).then (company)=>
  #           if company
  #             contactId = contact.vid || contact.identityProfile.vid
  #             wagner.get('HubspotManager').connectCompanyWithContact(company.companyId, contactId).then (AddContactToCompany)=>
  #               if AddContactToCompany
  #                 result = {}
  #                 result.contactId = contactId
  #                 result.companyId = company.companyId
  #                 resolve result
  #               else
  #                 reject "unable to connect company with contact"
  #           else
  #             reject "unable to create company"
  #       else
  #         reject "Unable to create contact"

  # app.post '/apis/createHubspotLead', (req, res) ->
  #   options =
  #     companyName: req.body.companyName
  #     companyId: req.body.companyId
  #     offerId: req.body.offerId

  #   wagner.get('HubspotManager').createLead(options).then (leadCreated)=>
  #       res.status(HTTPStatus.OK).json
  #         success:'1'
  #         message: leadCreated
  #     .catch (error) =>
  #       wagner.get('Raven').captureException(error)
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success:'0'
  #         message: constants.error_messages['Default']
  #         error: error.stack

  ###
  Receive response from zapier via hubspot
  If contact find, create Lead else create contact and lead
  ###
  # app.post '/apis/getCompanyDetailsFromHubspot', (req, res) ->
  #   if _.isEmpty(DealUser) && _.isEmpty(DealInventory) && _.isEmpty(DealOffer)
  #     return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success:'0'
  #       message: 'Can not find deal user, inventory and dealOffer'

  #   if req.body['companyId'] and req.body['companyName']
  #     companyName = req.body['companyName']
  #     companyId = req.body['companyId']
  #     wagner.get('HubspotManager').findCompanyContacts(companyId).then (result)=>
  #       contactFound = _.find result.contacts, (contact) -> contact.identities[0].identity[0].value == DealInventory['Dealer']['email']
  #       if !contactFound
  #         wagner.get('HubspotManager').createContact(DealUser, DealInventory, DealOffer).then (contact) =>
  #           contactId = contact.vid
  #           if contact.identityProfile.vid
  #             contactId = contact.identityProfile.vid

  #           wagner.get('HubspotManager').connectCompanyWithContact(companyId, contactId).then (connectedContact) =>
  #             createLeadAndSendEmail(companyId, contactId, DealUser, DealInventory, DealOffer).then ()=>
  #               console.log 'Lead created with existing company and new contact'
  #               res.status(HTTPStatus.OK).json
  #                 success:'1'
  #                 message: 'Lead created with existing company and new contact'
  #             .catch (error) ->
  #               console.log 'Unable to create lead in hubspot' + error.message
  #               res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #                 success:'0'
  #                 message: constants.error_messages['Default']
  #                 error: error.stack
  #         .catch (error) ->
  #           console.log 'Unable to create contact in hubspot' + error.message
  #           res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #             success:'0'
  #             message: constants.error_messages['Default']
  #             error: error.stack
  #       else if contactFound
  #         createLeadAndSendEmail(companyId, contactFound.identities[0].vid, DealUser, DealInventory, DealOffer).then ()=>
  #           console.log 'Lead created'
  #           res.status(HTTPStatus.OK).json
  #             success:'1'
  #             message: 'Lead created with existing company and contact'
  #         .catch (error) ->
  #           console.log 'Unable to create lead in hubspot' + error.message
  #           res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #             success:'0'
  #             message: constants.error_messages['Default']
  #             error: error.stack
  #     .catch (error) ->
  #       console.log 'Error while finding company contact' + error
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success:'0'
  #         message: constants.error_messages['Default']
  #         error: error.stack
  #   else
  #     createCompanyAndContact(DealUser, DealInventory, DealOffer).then (result)=>
  #       createLeadAndSendEmail(result.companyId, result.contactId, DealUser, DealInventory, DealOffer).then ()=>
  #         console.log 'lead created and email sent'
  #         res.status(HTTPStatus.OK).json
  #           success:'1'
  #           message: 'Lead created with new company and contact'
  #       .catch (error) ->
  #         console.error 'Unable to create lead', error
  #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #           success:'0'
  #           message: constants.error_messages['Default']
  #           error: error.stack
  #     .catch (error) ->
  #       console.log 'Unable to create contact and new company' + error
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success:'0'
  #         message: constants.error_messages['Default']
  #         error: error.stack

  ###
  Buyer accepts the offer and creating Lead
  Offer added in Carblip database
  Offer sent to Google sheet via Zapier
  ###
  # app.post '/apis/acceptOffer', (req, res) ->
  #   query=
  #     vehicle_inventory_id: req.body.vehicle_inventory_id
  #     user_id: req.body.user_id
  #     last_offered_price: req.body.price
  #     premium: req.body.premium
  #     status: 1

  #   wagner.get('VehicleInventoryManager').acceptOffer(query).then (offer)=>
  #     offer.last_offered_price = req.body.price
  #     # Adding offer to Google sheet via Zapier
  #     wagner.get('UserManager').findById(req.body.user_id).then (user)=>
  #       wagner.get('VehicleInventoryManager').findById(req.body.vehicle_inventory_id).then (inventory)=>
  #         checkAndFindPrimaryDealer(inventory.Dealer).then (dealer)=>
  #           inventory.Dealer = dealer
  #           image_url = ''
  #           if inventory.VehicleColor.VehicleColorsMedia[0]
  #             image_url = inventory.VehicleColor.VehicleColorsMedia[0].image_url

  #           bidInfo =
  #             first_name: user.first_name
  #             last_name: user.last_name
  #             email_address: user.email_address
  #             phone: user.phone
  #             zip: user.zipcode
  #             brand: inventory['Brand']['name']
  #             model: inventory['Model']['name']
  #             year: inventory.year
  #             trim: inventory.trim
  #             msrp: inventory.msrp
  #             vin: inventory.vin
  #             image_url: image_url
  #             dealer_name: inventory['Dealer']['name']
  #             dealer_contact: inventory['Dealer']['contact']
  #             dealer_contact_name: inventory['Dealer']['contact_name']
  #             dealer_email: inventory['Dealer']['email']
  #             dealer_address: inventory['Dealer']['address']
  #             dealer_city: inventory['Dealer']['city']
  #             dealer_state: inventory['Dealer']['state']
  #             dealer_zip: inventory['Dealer']['zip']
  #             last_offered_price: req.body.price
  #             last_offer_made_at: offer.last_offer_made_at
  #             exterior_color: inventory.exterior_color
  #             interior_color: inventory.interior_color
  #             premium: offer.premium
  #             order_number: offer.order_number

  #           if inventory['VehicleColor']
  #             bidInfo.simple_color=inventory['VehicleColor']['simple_color']
  #           else
  #             bidInfo.simple_color= ""
  #           DealUser = user
  #           DealInventory = inventory
  #           DealOffer = offer
  #           wagner.get('EmailTransport').sendAcceptOfferConfirmationEmail(bidInfo).then (result)=>
  #               wagner.get('ZapierManager').sendData(bidInfo)
  #               wagner.get('ZapierManager').findOrCreateCompany(inventory['Dealer']['name'], offer.id).then ()=>
  #                   res.status(HTTPStatus.OK).json
  #                     success:'1'
  #                     message: "success"
  #               .catch (error) =>
  #                   res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #                     success:'0'
  #                     message: "Unable to get company details from zapier"
  #                     error: error.stack
  #           .catch (error) =>
  #             res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #                 success:'0'
  #                 message: "Error while sending confirmation email"
  #                 error: error.stack
  #         .catch (error) =>
  #           res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #              success:'0'
  #              message: "Unable to find primary dealer contact"
  #              error: error.stack
  #       .catch (error) =>
  #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #            success:'0'
  #            message: "Unable to find vehicle from inventory"
  #            error: error.stack
  #     .catch (error) =>
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #          success:'0'
  #          message: "Unable to find user from db"
  #          error: error.stack
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error.stack

  app.post '/apis/verifyEmail', (req, res) ->
    query=
      where:
        email_address: req.body.email
        login_verify_code: req.body.passcode
    wagner.get('UserManager').checkToken(query).then (user)=>
      if user
        wagner.get('UserManager').createSession(user).then (result)=>
          user_session = result.user_session
          wagner.get('UserManager').updateDeviceToken(user_session.user_id, req.body.device_token).then (up_user)=>
            res.status(HTTPStatus.OK).json
               success:'1'
               message: "success"
               result: user_session
      else
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success:'0'
            message: "Incorrect Passcode!"
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error

  # app.post '/apis/deleteOffer', (req, res) ->
  #   options=
  #     offer_id: req.body.offer_id

  #   wagner.get('VehicleInventoryManager').deleteOffer(options).then (result)=>
  #     res.status(HTTPStatus.OK).json
  #        success:'1'
  #        message: "success"
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #        success:'0'
  #        message: constants.error_messages['Default']
  #        error: error

  # app.post '/apis/acceptGroupOffer', (req, res) =>
  #   wagner.get('VehicleInventoryManager').acceptOfferMutliple(req.body).then (result) =>
  #     res.status(HTTPStatus.OK).json
  #       success: '1'
  #       message: 'success'
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success: '0'
  #       message: constants.error_messages['Default']
  #       error: error.stack

  # app.post '/apis/notification', (req, res) =>
  #   options =
  #     device_token: req.body.device_token

  #   message = if req.body.message then req.body.message else 'Test notification message';

  #   console.log(config.UrbanAirship)
  #   ua = new UA(config.UrbanAirship.appKey, config.UrbanAirship.appSecret, config.UrbanAirship.appMasterSecret)
  #   ua.registerDevice options.device_token, (error) ->
  #     if error
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         message: constants.error_messages['Default']
  #         error: error.stack
  #     else
  #       payload0 =
  #         'audience': 'device_token': options.device_token
  #         'notification':
  #           'alert': message
  #           'ios':
  #               'sound': 'default'
  #               'badge': '+1'
  #         'device_types': [ 'ios' ]
  #       # sending push
  #       ua.pushNotification '/api/push', payload0, (error) ->
  #         if error
  #           res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #             success: '0'
  #             message: constants.error_messages['Default']
  #             error: error.stack
  #         else
  #           res.status(HTTPStatus.OK).json
  #             success: '1'
  #             message: 'success'

  # app.post '/apis/zip_lookup', (req, res) =>
  #   options=
  #     zip: req.body.zip
  #     radius: req.body.radius or 150

  #   CB_SERVICE_AREA_ZIP = '90401';
  #   codes = zipcodes.radius(CB_SERVICE_AREA_ZIP, options.radius);

  #   res.status(HTTPStatus.OK).json
  #      success: '1'
  #      message: 'success'
  #      result: codes.indexOf(req.body.zip) > 0

  # app.post '/apis/user_interest', (req, res) =>
  #   options=
  #     zip: req.body.zip
  #     email_address: req.body.email_address

  #   wagner.get('UserManager').trackUserInterest(options).then (response) =>
  #     res.status(HTTPStatus.OK).json
  #        success: '1'
  #        message: 'success'
  #   .catch (error) =>
  #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #       success: '0'
  #       message: constants.error_messages['Default']
  #       error: error.stack

  app.post '/apis/getStyles', (req, res) =>
    payload=
      models:req.body.models
      min_price:req.body.min_price
      max_price:req.body.max_price

    # fetch all vehicles trims for a model
    wagner.get('VehicleManager').fetchVehicleByModels(payload).then (vehicles)=>
      if vehicles? && vehicles.length
        result = _.map vehicles, (item) =>
          helpers.formatModelData(item)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: result
      else
        res.status(HTTPStatus.NOT_FOUND).json
          success:'0'
          type: 'trim_not_found'
          message: constants.error_messages['SomethingWrong']
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.NOT_FOUND).json
        success:'0'
        message: constants.error_messages['SomethingWrong']

  app.post '/apis/getDefaultConfiguration', (req, res) =>
    payload=
      vehicles:req.body.vehicles

    # fetch all vehicles trims colors for a model
    wagner.get('VehicleManager').fetchDefaultConfigurationByStyleId(payload).then (result)=>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        case: 1
        message: constants.error_messages['Default']
  
  app.post '/apis/getColorOptionsById', (req, res) =>
    payload=
      configuration_state_id: req.body.configuration_state_id

    # fetch all vehicles trims colors for a model
    wagner.get('VehicleManager').fetchColorOptionsById(payload).then (result)=>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']
  
  app.post '/apis/getConfigurationById', (req, res) =>
    payload=
      configuration_state_id: req.body.configuration_state_id

    # fetch all vehicles trims colors for a model
    wagner.get('VehicleManager').fetchConfigurationById(payload).then (result)=>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        case: 1
        message: constants.error_messages['Default']
  
  app.post '/apis/toggleOption', (req, res) =>
    payload=
      vehicles:req.body.vehicles
      configuration_state_id:req.body.configuration_state_id
      option:req.body.option

    # fetch options for a style
    wagner.get('VehicleManager').fetchConfigurationByOptionsRecursive(payload).then (result)=>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: result
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        case: 2
        message: constants.error_messages['Default']

  app.post '/apis/getTrimsTitledOptions', (req, res) =>
    payload=
      vehicles:req.body.vehicles

    # fetch all vehicles trims options for a model
    wagner.get('VehicleInventoryManager').fetchVehicleOptionsByTrim(payload).then (vehicles)=>
      vehicleOptions = wagner.get('VehicleManager').getAllVehicleOptionsWithTitle();
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: vehicleOptions
    .catch (error)=>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          message: constants.error_messages['Default']

  app.post '/apis/getInventoryCount', (req, res) =>
    payload=
      vehicles: req.body.vehicles
      interior_colors: req.body.interior_colors || []
      exterior_colors: req.body.exterior_colors || []
      option_preferences: req.body.option_preferences || []

    wagner.get('RequestsManager').getInventoryCount(payload).then (result) =>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        count: result
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']
  
  app.post '/apis/searchVehicles', (req, res) =>
    year = req.body.year || null
    payload=
      keyword: req.body.keyword || ''
      year: year
    pagination =
      page: req.body.page || 1
      count: req.body.count || 9

    wagner.get('VehicleManager').searchVehicle(payload, pagination).then (result) =>
      data = _.map result.rows, (item) => helpers.formatTrimData(item)
      pagination_result = 
        total: result.count
        per_page: pagination.count
        current_page: pagination.page
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: 
          data: data
          pagination: pagination_result
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']

  app.post '/apis/createDealFromPortal', [
    # checkAuthenticated.isPortalRequest
  ], (req, res) =>
    user_id = req.body.user_id
    vehicle_id = req.body.vehicle_id
    dealstage_id = req.body.dealstage_id
    portal_deal_stage = req.body.portal_deal_stage

    wagner.get('UserManager').getUserById(user_id).then (user) ->
      if (user)
        payload=
          source_utm: 3,
          vehicle_id: vehicle_id
          user_id: user.id
          dealstage_id: dealstage_id
          portal_deal_stage:portal_deal_stage || null
          is_complete: if req.body.is_complete then 1 else 0
          
        payload = _.extend payload, req.body

        wagner.get('RequestsManager').createPortalRequestLeads(payload).then (result) =>
          res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: result
        .catch (error)=>
          wagner.get('Raven').captureException(error)
          console.log error.message
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']

  app.post '/apis/createRequestFromCustom', [
    checkAuthenticated.isLoggedIn
  ], (req, res) =>
    token = req.header('token')
    user_agent = req.header('User-Agent') || null
    source_utm = null;
    if user_agent == 'iOS'
      source_utm = 2
    else if user_agent
      source_utm = 1

    wagner.get('UserManager').getToken(token).then (user_session) ->
      if (user_session)
        payload=
          source_utm: source_utm
          vehicle_type: req.body.vehicle_type
          price_type: req.body.price_type
          min_price: req.body.min_price
          max_price: req.body.max_price
          credit_score: req.body.credit_score
          buying_time: req.body.buying_time
          buying_method: req.body.buying_method
          referral_code: req.body.referral_code
          user_id: user_session.user_id
          # change this to not complete
          is_complete: if req.body.is_not_complete then 0 else 1

        payload = _.extend payload, req.body

        wagner.get('RequestsManager').createCustomRequestLeads(payload).then (result) =>
          res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: result
        .catch (error)=>
          wagner.get('Raven').captureException(error)
          console.log error.message
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: constants.error_messages['Default']

  app.post '/apis/createRequestFromPreferences', [
    checkAuthenticated.isLoggedIn
  ], (req, res) =>
    token = req.header('token')
    user_agent = req.header('User-Agent') || null
    source_utm = null;
    if user_agent == 'iOS'
      source_utm = 2
    else
      source_utm = 1

    wagner.get('UserManager').getToken(token).then (user_session) ->
      if (user_session)
        payload=
          source_utm: source_utm,
          vehicles: req.body.vehicles
          interior_colors: req.body.interior_colors || []
          interior_colors_oem: req.body.interior_colors_oem || []
          exterior_colors: req.body.exterior_colors || []
          exterior_colors_oem: req.body.exterior_colors_oem || []
          option_preferences: req.body.option_preferences || []
          credit_score: req.body.credit_score
          buying_time: req.body.buying_time
          buying_method: req.body.buying_method
          referral_code: req.body.referral_code
          user_id: user_session.user_id
          user_car_information: req.body.user_car_information
          # change this to not complete
          is_complete: if req.body.is_not_complete then 0 else 1
          configuration_state_id: req.body.configuration_state_id

        payload = _.extend req.body, payload

        wagner.get('RequestsManager').getAllRequestCount(payload).then (count) =>
          if (payload.is_complete || (!payload.is_complete && !count))
            wagner.get('RequestsManager').createRequestLeads(payload).then (result) =>
              res.status(HTTPStatus.OK).json
                success: '1'
                message: 'success'
                data: result
              if payload.is_complete
                wagner.get('UserManager').createUserLeaseInformation(payload).then (userLease) =>
                  console.log 'User Lease Info successfully created'
                .catch (error) =>
                  wagner.get('Raven').captureException(error)
                  console.log error.stack
            .catch (error)=>
              wagner.get('Raven').captureException(error)
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success: '0'
                message: error.stack
          else
            res.status(HTTPStatus.OK).json
              success: '1'
              message: 'success'
              data: null
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error)=>
      console.log("errr",error)
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        message: error.stack

  app.get '/apis/getVehicleRequests', [
    checkAuthenticated.isLoggedIn
  ], (req, res) =>
    token = req.header('token')

    wagner.get('UserManager').getToken(token).then (user_session) ->
      if (user_session)
        payload=
          user_id: user_session.user_id
          is_complete: 1
        pagination =
          page: req.body.page || req.query.page || 1
          count: req.body.count || req.query.count || 9

        wagner.get('RequestsManager').getRequests(payload, pagination).then (result) =>
          pagination_result = 
            total: result.count
            per_page: pagination.count
            current_page: pagination.page

          data = _.map result.rows, (item) =>
            helpers.formatMyRequest(item)

          res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: 
              data: data
              pagination: pagination_result
        .catch (error)=>
            wagner.get('Raven').captureException(error)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              error: error.message
              message: constants.error_messages['Default']
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
        success: '0'
        error: error.message
        message: constants.error_messages.Unauthorized
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.UNAUTHORIZED).json
        success: '0'
        error: error.message
        message: constants.error_messages.Unauthorized

  app.post '/apis/getLeaseInformation', [
    checkAuthenticated.isLoggedIn
  ], (req, res) =>
    token = req.header('token')

    wagner.get('UserManager').getToken(token).then (user_session) ->
      if (user_session)
        payload=
          user_id: user_session.user_id

        wagner.get('UserManager').getUserLeaseInformation(payload).then (result) =>
          res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: result
        .catch (error)=>
            wagner.get('Raven').captureException(error)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              error: error
              message: constants.error_messages['Default']
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error)=>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.UNAUTHORIZED).json
        success: '0'
        error: error
        message: constants.error_messages.Unauthorized

  app.post '/apis/logout', (req, res) ->
    req.logout()
    payload =
      token: req.header('token')
    wagner.get('UserManager').logout(payload).then((user) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
    ).catch (error) ->
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        error: error
        message: constants.error_messages['Default']
  
  app.post '/apis/updateUserAppVersion', [
    checkAuthenticated.isLoggedIn
  ], (req, res) =>
    if !req.body.app_version
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: "app_version is required"
    payload=
      token: req.header('token')
      app_version: req.body.app_version
    wagner.get('UserManager').updateAppVersion(payload).then (result)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error
  
  app.get '/apis/getUserAppVersion', [
    checkAuthenticated.isLoggedIn
    ], (req, res) =>
    payload=
      token: req.header('token')
    wagner.get('UserManager').getAppVersion(payload).then (result)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error
  
  app.get '/apis/getMinimumAppVersion', (req, res) =>
    wagner.get('AppVersionManager').getMinimumAppVersion().then (result)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error

  app.get '/apis/getFaqs', (req, res) =>
    res.status(HTTPStatus.OK).json
      success:'1'
      message: "success"
      data: constants.faqs

  app.post '/apis/facebookLeadsHook', [
    check('email')
      .isLength({min:1})
      .withMessage('Email is required'),
    check('email')
      .isEmail()
      .withMessage('Email is invalid'),
    ],(req, res) ->

    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })
    
    phone = ''
    if req.body.phone
      phone = helpers.formatPhoneNumber(req.body.phone)

    payload = 
      email: req.body.email
    if req.body.first_name
      payload.first_name = req.body.first_name 
    if req.body.phone
      payload.phone = req.body.phone 
    if req.body.year
      payload.year = req.body.year 
    if req.body.make
      payload.make = req.body.make 
    if req.body.model
      payload.model = req.body.model 
    if req.body.mileage
      payload.mileage = req.body.mileage

    wagner.get('FacebookManager').handleLeadHook(payload).then (lead)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         data: lead
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error.stack
  
  app.post '/apis/getFacebookLeadInfo', [
    check('uri')
      .isLength({min:1})
      .withMessage('URI is required')
    check('uri')
      .custom((uri) => 
        return wagner.get('FacebookManager').isValidURI(uri)
      )
    ],(req, res) ->

    errors = validationResult(req)
    if (!errors.isEmpty())
      error_arr = errors.array()
      return res.status(422).json({
        success:'0'
        message: error_arr[0].msg
        error: error_arr
      })

    wagner.get('FacebookManager').getLeadInfoFromURI(req.body.uri).then (lead)=>
      res.status(HTTPStatus.OK).json
         success:'1'
         message: "success"
         data: lead
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
         success:'0'
         message: constants.error_messages['Default']
         error: error.stack

  app.post '/apis/updateFacebookLeadInfo', (req, res) ->

    payload = 
      email: req.body.email && req.body.email.trim()
      first_name: req.body.first_name && req.body.first_name.trim()
      last_name: req.body.last_name && req.body.last_name.trim()
      lease_end_date: req.body.lease_end_date
      year: req.body.year
      make: req.body.make
      mileage: req.body.mileage
      model: req.body.model && req.body.model.trim()
      phone: helpers.formatPhoneNumber(req.body.phone)
      vehicle_condition: req.body.vehicle_condition
      exterior_color: req.body.exterior_color
      interior_color: req.body.interior_color
      vin: req.body.vin
      smoke_free: req.body.smoke_free
      number_keys: req.body.number_keys
      bank_lender: req.body.bank_lender
      account: req.body.account
      payoff_amount: req.body.payoff_amount
      is_submitted: req.body.is_submitted || false
    
    wagner.get('FacebookManager').isValidURI(req.body.uri).then (lead)=>
      if lead
        lead_id = lead.id
        wagner.get('FacebookManager').createFbUser(payload).then (user)=>
          wagner.get('FacebookManager').updateLeadInfo(lead_id, payload, user).then (result)=>
            wagner.get('FacebookManager').getLeadInfo(lead_id).then (lead)=>
              if payload.is_submitted
                wagner.get('EmailTransport').fbLeadSubmitEmail(lead)
              res.status(HTTPStatus.OK).json
                success:'1'
                message: "success"
                data: lead
            .catch (error) =>
              wagner.get('Raven').captureException(error)
              res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                success:'0'
                message: constants.error_messages['Default']
                error: error.message
          .catch (error) =>
            wagner.get('Raven').captureException(error)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success:'0'
              message: constants.error_messages['Default']
              error: error.message
        .catch (error) =>
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success:'0'
            message: constants.error_messages['Default']
            error: error.message
      else
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: 'URI is invalid'
          error: null
    .catch (error) =>
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
          error: error.message

  app.get '/apis/getCreditApplication/:id', [
    checkAuthenticated.isLoggedIn
    ], (req, res) =>
    wagner.get('RequestsManager').getCreditApplicationById(req.params.id).then (result)=>
      res.status(HTTPStatus.OK).json
        success: '1'
        message: 'success'
        data: result
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        error: error.stack
        message: constants.error_messages['Default']

  app.post '/apis/saveCreditApplication', [
    checkAuthenticated.isLoggedIn
    ], (req, res) =>
    token = req.header('token')
    request_id = req.body.vehicle_request_id
    
    user_agent = req.header('User-Agent') || null
    source_utm = null;
    if user_agent == 'iOS'
      source_utm = 2
    else if user_agent
      source_utm = 1

    @wagner.get('UserManager').getUserIdByToken(token).then (userId)=>
      if (userId)
        payload = req.body
        if payload.primary_applicant
          payload.primary_applicant = _.extend payload.primary_applicant, {
            user_id: userId
            vehicle_request_id: request_id
            source_utm: source_utm
          }
        if payload.co_applicant
          payload.co_applicant = _.extend payload.co_applicant, {
            user_id: userId
            vehicle_request_id: request_id
            source_utm: source_utm
          }
        wagner.get('RequestsManager').saveCreditApplicationById(request_id, payload).then (result)=>
          wagner.get('RequestsManager').getCreditApplicationById(request_id).then (result)=>
            wagner.get('CreditApplicationManager').exportCreditApp(request_id).then (credit_app_result) =>
              console.log 'credit app exported successfully'
            .catch (error) =>
              console.log error
            res.status(HTTPStatus.OK).json
              success: '1'
              message: 'success'
              data: result
          .catch (error) =>
            console.log error
            wagner.get('Raven').captureException(error)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              error: error.stack
              message: constants.error_messages['Default']
        .catch (error) =>
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success: '0'
            error: error.stack
            message: constants.error_messages['Default']
      else
        res.status(HTTPStatus.UNAUTHORIZED).json
          success: '0'
          message: constants.error_messages.Unauthorized
    .catch (error) =>
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success: '0'
        error: error.stack
        message: constants.error_messages['Default']

  app.post '/apis/deleteAllCreditApp', [ ], (req, res) =>
      @wagner.get('CreditApplicationManager').deleteAllCreditApp().then (result)=>
            if result
                  res.status(HTTPStatus.OK).json
                    success:'1'
                    message: "success",
                    data:result
            else
                  res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
                    success:'0'
                    message: constants.error_messages['Default'] 
      .catch (error) =>
          console.log error
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success:'0'
            message: constants.error_messages['Default']
            error: error 

  app.post '/apis/fetchDealer', [
    checkAuthenticated.isPortalRequest
    ], (req, res) =>

    res.status(HTTPStatus.OK).json
      success: '1'
      message: 'success'

    console.log  'Fetching MScan data'
    wagner.get('MarketScanManager').fetchDealer().then (dealers) ->
      wagner.get('CDealerManager').upsertDealers(dealers).then (result) ->
        console.log 'success'  
      .catch (error) =>
        console.log(error.stack)
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.OK).json
          success: '0'
          message: constants.error_messages['Default']
    .catch (error) =>
      console.log(error.stack)
      wagner.get('Raven').captureException(error)
      res.status(HTTPStatus.OK).json
          success: '0'
          message: constants.error_messages['Default']

  app.post '/apis/fetchInventory', [
    checkAuthenticated.isPortalRequest
    ], (req, res) =>

    res.status(HTTPStatus.OK).json
      success: '1'
      message: 'success'

    console.log  'Fetching Inventory data'
    wagner.get('CDealerManager').getAll({is_active: 1}).then (dealers) ->
      async.eachSeries dealers, ((item, callback) =>
          account_id = item.id
          console.log 'Dealer ID:' + account_id
          wagner.get('MarketScanManager').fetchInventory(account_id, false).then (inventories) ->
              wagner.get('CInventoryManager').upsertInventories(inventories).then (result1) ->
                  wagner.get('MarketScanManager').fetchInventory(account_id, true).then (inventories) ->
                      wagner.get('CInventoryManager').upsertInventories(inventories).then (result2) ->
                          console.log 'success'
                          callback()
                      .catch (error)=>
                          console.log error
                          callback()
                  .catch (error)=>
                      console.log error
                      callback()
              .catch (error)=>
                  console.log error
                  callback()
          .catch (error)=>
              console.log error
              callback()
      ),(err) ->
          if err
              console.log err
          else
              console.log 'all success'
    .catch (error)=>
        console.log error


  # app.post '/apis/removeTestLeads', (req, res) =>
  #   payload=
  #     email_addresses: req.body.email_addresses || []
  #   wagner.get('HubspotManager').removeTestDeals(payload).then (result) =>
  #     res.status(HTTPStatus.OK).json
  #       success: '1'
  #       message: 'success'
  #       data: result
  #   .catch (error)=>
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         error: error
  #         message: constants.error_messages['Default']

  # app.post '/apis/removeTestContacts', (req, res) =>
  #   payload=
  #     email_addresses: req.body.email_addresses || []

  #   wagner.get('HubspotManager').removeTestContacts(payload).then (result) =>
  #     res.status(HTTPStatus.OK).json
  #       success: '1'
  #       message: 'success'
  #       data: result
  #   .catch (error)=>
  #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
  #         success: '0'
  #         error: error
  #         message: constants.error_messages['Default']


  ###
  # v1 api namespace
  ###
  app.namespace '/apis/v1', () => 
    
    ###
    # return empty style configration for vehicle
    ###
    app.get '/getInitialConfiguration/:vehicle_id', (req, res) =>

      vehicle_id = req.params.vehicle_id

      # fetch all vehicles trims colors for a model
      wagner.get('VehicleManager').fetchInitialConfigurationByStyleId(vehicle_id).then (result)=>
        res.status(HTTPStatus.OK).json
          success: '1'
          message: 'success'
          data: result
      .catch (error) =>
        console.log error
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          case: 1
          message: constants.error_messages['Default']

    ###
    # toggle chrome option
    ###
    app.post '/toggleOption', [
      check('vehicle_id')
        .isLength({min:1})
        .withMessage('vehicle_id is required')
      check('configuration_state_id')
        .isLength({min:1})
        .withMessage('configuration_state_id is required'),
      check('option')
        .isLength({min:1})
        .withMessage('option is required'),
    ],(req, res) =>
      errors = validationResult(req)
      if (!errors.isEmpty())
        error_arr = errors.array()
        return res.status(422).json({
          success:'0'
          message: error_arr[0].msg
          error: error_arr
        })

      select_data = req.body.user_selection || {}
      option_type = req.body.option_type || null
      is_recursive = false

      user_selection = 
        exterior_color: select_data.exterior_color || null
        interior_color: select_data.interior_color || null
        wheel: select_data.wheel || []
        options: select_data.options || []

      payload=
        vehicle_id: req.body.vehicle_id
        configuration_state_id: req.body.configuration_state_id
        option: req.body.option
        user_selection: req.body.user_selection

      # fetch options for a style
      wagner.get('VehicleManager').toggleConfigurationByOption(payload, is_recursive).then (result)=>
        res.status(HTTPStatus.OK).json
          success: '1'
          message: 'success'
          data: result
      .catch (error)=>
        console.log error
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success: '0'
          case: 2
          message: constants.error_messages['Default']

   app.get '/apis/getPortalUser', (err, req, res) ->
    # fetch all users
     payload=
       promo_code:"34"
     wagner.get('CPortaluserManager').getPortalUserList(payload).then((users) ->
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
        data: users
    ).catch (e) ->
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']

    app.post '/apis/lead', (req, res)->
      accesstoken = config.carsdirect.accessToken;
      token = req.query.cdapikey;
      if !token || accesstoken != token
          return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(
             success:'0'
             message: constants.error_messages['InvalidCardirectToken'])
      else
          extractedData=req.body; 
          extractedData=extractedData.replace(/\\n/g, " ");
          extractedData=extractedData.replace(/\\"/g, '"');
          # extractedData = convert.xml2json(xmldata, {compact: true})
          # res.status(200).json
          #   data:JSON.parse(extractedData)
          wagner.get('CarsDirectRequestManager').storeCarsRequestInfo(extractedData).then((carsdata) ->
            res.status(HTTPStatus.OK).json
              success:'1'
              message: 'success'
              data: carsdata
          ).catch (e) ->
            wagner.get('EmailTransport').carsDirectApiFailedEmail(extractedData)
            wagner.get('Raven').captureException(e)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success:'0'
              message: constants.error_messages['Default']

    app.post '/apis/leadCBThree', (req, res)->
      accesstoken = config.carsdirectCB3.accessToken;
      token = req.query.cdapikey;
      if !token || accesstoken != token
          return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(
             success:'0'
             message: constants.error_messages['InvalidCardirectToken'])
      else
          extractedData=req.body; 
          extractedData=extractedData.replace(/\\n/g, " ");
          extractedData=extractedData.replace(/\\"/g, '"');

          # extractedData = convert.xml2json(xmldata, {compact: true})
          # res.status(200).json
          #   data:JSON.parse(extractedData)
          wagner.get('CarsDirectRequestManager').storeCarsRequestInfoCBThree(extractedData).then((carsdata) ->
            res.status(HTTPStatus.OK).json
              success:'1'
              message: 'success'
              data: carsdata
          ).catch (e) ->
            wagner.get('EmailTransport').carsDirectApiFailedEmail(extractedData)
            wagner.get('Raven').captureException(e)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success:'0'
              message: constants.error_messages['Default']


    app.get '/apis/getVehiclesByNullPrice', (req, res) ->
     wagner.get('VehicleManager').fetchAllNullPrice('0').then((vehicles) ->
      fetchColor=(pos) ->
        if pos == vehicles.length
         process.exit()
        else
          vehicle_id = vehicles[pos].id
          console.log "Fetching for Vehicle Price Information: ",vehicle_id," ->",vehicles[pos].trim
          wagner.get('ChromeDataManager').fetchVehicleInfo(vehicle_id).then (result)=>
            console.log 'success'
            fetchColor(pos+1)
          .catch (error)=>
            console.log error
            fetchColor(pos+1)        
      fetchColor(0)
      res.status(HTTPStatus.OK).json
        success:'1'
        message: "success"
        data: vehicles
    ).catch (e) ->
      console.log("Ee",e)
      wagner.get('Raven').captureException(e)
      res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        success:'0'
        message: constants.error_messages['Default']

    app.get '/apis/getModelsAndUpdate', (req, res) ->
      wagner.get('ModelManager').fetchAllMsrpNull().then((models) ->
        wagner.get('VehicleManager').fetchByMinPrice().then((vehicles) ->
            if vehicles.length >0
              for  vehicle in vehicles 
                options =
                  msrp:vehicle.price
                wagner.get('ModelManager').fetchByModelId(options,vehicle.model_id).then((model) ->
                  console.log('Model Update',model);
                ).catch (e)=>
                  console.log e
                  wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: models
        ).catch (e)=>
          console.log e
          wagner.get('Raven').captureException(e)
      ).catch (e) ->
        console.log("Errr",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.get '/apis/getModelScrapper', (req, res) ->
      wagner.get('BrandsManager').fetchAllBrands().then (brands) ->
        fetchModel=(pos, year) ->
            if pos == brands.length
                process.exit()
            else
                brand_id = brands[pos].id
                console.log "Fetching for ",brand_id,":",brands[pos].name,"(",year,")" 
                wagner.get('ChromeDataManager').fetchModel(brand_id, year).then (result)=>
                    if (year < 2021)
                        fetchModel(pos, year+1)
                    else
                        fetchModel(pos+1, 2019)
                .catch (error)=>
                    Raven.captureException error
                    if (year < 2021)
                        fetchModel(pos, year+1)
                    else
                        fetchModel(pos+1, 2019)
        fetchModel(0, 2019)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: brands
      .catch (e) ->
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
    
    app.get '/apis/getTrimScrapper', (req, res) ->
      wagner.get('ModelManager').fetchAll().then (models) ->
        fetchStyle=(pos) ->
            if pos == models.length
                process.exit()
            else
                model_id = models[pos].id
                console.log "Fetching for model: ",model_id," ->",models[pos].name
                wagner.get('ChromeDataManager').fetchStyle(model_id).then (result)=>
                    console.log result
                    fetchStyle(pos+1)
                .catch (error)=>
                    wagner.get('Raven').captureException(error)
                    console.log error
                    fetchStyle(pos+1)
        fetchStyle(0)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: result
      .catch (e) ->
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.get '/apis/updateRquestRegisterUser', (req, res) ->
      wagner.get('CarsDirectRequestManager').updateRequestAndUser().then (cars) ->
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: cars
      .catch (e) ->
        console.log("Error",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.get '/apis/updateUserFromCarsRequest', (req, res) ->
      wagner.get('CarsDirectRequestManager').updateRequestAndUserBasedOnCarsDirectRequest().then (cars) ->
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: cars
      .catch (e) ->
        console.log("Error",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.get '/apis/updateCarsDirectSource', (req, res) ->
      wagner.get('CarsDirectRequestManager').updateCarsDirectSource().then (cars) ->
        console.log("Length",cars.length)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: cars
      .catch (e) ->
        console.log("Error",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
    
    app.get '/apis/updateVehicleRequestReferalCode', (req, res) ->
      wagner.get('CarsDirectRequestManager').updateVehicleRequestReferalCode().then (cars) ->
        console.log("Length",cars.length)
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: cars
      .catch (e) ->
        console.log("Error",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.post '/apis/addToMailchimp', (req,res) ->
      payload=
          first_name: req.body.first_name && req.body.first_name.trim() || ''
          last_name: req.body.last_name && req.body.last_name.trim() || ''
          email_address: req.body.email_address && req.body.email_address.trim() || ''
          phone: req.body.phone && req.body.phone || ''
      payload.phone = helpers.formatPhoneNumber(payload.phone)
      wagner.get('MailchimpManager').patchUser(payload).then (result) ->
        console.log("Result",result);
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: result
      .catch (e) ->
        console.log("Error",e)
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.get '/apis/getSourceWiseRequests', (req, res) ->
      wagner.get('RequestsManager').getSourceWiseRequests().then((result) ->
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
          data: result
      ).catch (e) ->
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: e.stack

    app.post '/apis/sendWrongLeadInfoMail', (req, res) ->
      options = req.body
      options = JSON.parse(options)
      leadId = options?.subject.split " "
      leadId = leadId[leadId.length-1]
      # send welcome email
      wagner.get('EmailTransport').sendRejectedLeadMail(options).then (result) =>
        console.log 'Mail successfully sent'
        message = 'New Car Lead '+ leadId + ' ' + 'bounced back'
        slack.notify message, (err, result) ->
            if err
              console.log 'Slack Err: ', err
            else
              console.log 'Notified'  
      .catch (error) =>
        wagner.get('Raven').captureException(error)
        console.log error


    app.post '/apis/leadEmailSync', (req, res)->
      accesstoken = config.carsdirect.accessToken;
      token = req.query.cdapikey;
      if !token || accesstoken != token
          return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json(
             success:'0'
             message: constants.error_messages['InvalidCardirectToken'])
      else
          extractedData=req.body; 
          extractedData = extractedData[0];
          wagner.get('CarsDirectRequestManager').storeCarsRequestInfo(extractedData).then((carsdata) ->
            res.status(HTTPStatus.OK).json
              success:'1'
              message: 'success'
              data: carsdata
          ).catch (e) ->
            wagner.get('EmailTransport').carsDirectApiFailedEmail(extractedData)
            wagner.get('Raven').captureException(e)
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success:'0'
              message: constants.error_messages['Default']
    
    
    app.post '/apis/generateContactReferral', (req, res)->
      info = req.body
      data = null
      if info
        contactId = info.vid
        data =
          firstname: info.properties.firstname.value
          lastname: info.properties.lastname.value
      
        randomNumber = Math.floor(Math.random()*(999-100+1)+100)
        if data.firstname.length > 2
          data.firstname = data.firstname.substr(0,3)
        else
          data.firstname = data.firstname + Math.floor(Math.random()*(999-100+1)+100)
          data.firstname = data.firstname.substr(0,3)

        if data.lastname.length > 2
          data.lastname = data.lastname.substr(0,3)
        else
          data.lastname = data.lastname + Math.floor(Math.random()*(999-100+1)+100)
          data.lastname = data.lastname.substr(0,3)

        generatedReferralURL = config.webUrl + "/" + (data.firstname + data.lastname + randomNumber).toLowerCase()

        # wagner.get('HubspotManager').updateHubspotContactReferral(generatedReferralURL,contactId).then (result) =>
        #   res.status(HTTPStatus.OK).json
        #     success: '1'
        #     message: 'success'
        #     data: result
        # .catch (error)=>
        #     res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
        #       success: '0'
        #       error: error
        #       message: constants.error_messages['Default']

    
    # app.post '/apis/createHBContactNotes', (req, res) =>
    #   info = req.body
    #   if info
    #     contact_email = info.contact_email
    #     notes = info.notes
    #   @wagner.get('HubspotManager').getHubspotContact(contact_email).then (contact) =>
    #     # contact_id = contact.vid
    #     contact_id = contact.id
    #     @wagner.get('HubspotManager').createContactNote(contact_id, notes).then (result) =>
    #       res.status(HTTPStatus.OK).json
    #         success: '1'
    #         message: 'success'
    #         data: "Suceess"
    #     .catch (error) =>
    #         console.log error
    #         res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
    #           success:'0'
    #           message: constants.error_messages['Default']
    #           error: error
    #   .catch (error) =>
    #       console.log error
    #       res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
    #       success:'0'
    #       message: constants.error_messages['Default']
    #       error: error 


    app.post '/apis/getFileFromDrive', [
      # checkAuthenticated.isPortalRequest
    ] ,(req, res) =>
      fileInfo = req.body
      try
        wagner.get('UserManager').getDriveFiles(fileInfo).then((result)=> 
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: result
        ).catch (e) ->
          wagner.get('Raven').captureException(e)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
      catch error
        console.log("Error", error);


    app.post '/apis/getFileFromS3', [
      # checkAuthenticated.isPortalRequest
    ], (req, res) =>
      fileInfo = req.body
      encryptToken = fileInfo.passphrase
      try
        wagner.get('UserManager').getFile(fileInfo).then((result)=> 
          result = CryptoJS.AES.encrypt(result, encryptToken).toString()
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: result
        ).catch (e) ->
          wagner.get('Raven').captureException(e)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']
      catch error
        console.log("Error", error);

    app.post '/apis/sendCreditApplicationNotification', (req, res) =>
      options = req.body
      url = ""
      options['url'] = url
      options['message'] = "Please check the submitted application form. Link is below."
      wagner.get('EmailTransport').sendCreditApplicationNotification(options).then (result) =>
        console.log("Email sent successfully.")
        res.status(HTTPStatus.OK).json
          success:'1'
          message: "success"
      .catch (error) =>
        wagner.get('Raven').captureException(error)
        console.log error

    app.post '/apis/sendalert', [
      # checkAuthenticated.isPortalRequest
    ], (req, res) =>
      alertInfo = req.body
      try
        alert = 
          eventType: alertInfo.eventType,
          message: alertInfo.message 
        wagner.get('ZapierManager').sendAlert(alert).then (result) =>
          console.log 'alert sent successfully'
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: result
      catch error
        console.log("Error", error);

    
    app.post '/apis/registerusersib', [
      # checkAuthenticated.isPortalRequest
    ], (req, res) =>
      userInfo = req.body
      try
        payload = 
          email_address: userInfo.email_address
          first_name: userInfo.first_name
          last_name: userInfo.last_name
          phone: userInfo.phone

        payload.phone = helpers.formatPhoneNumber(payload.phone)

        wagner.get('MailchimpManager').patchUser(payload).then (result) ->
          res.status(HTTPStatus.OK).json
            success:'1'
            message: "success"
            data: result
      catch error
        wagner.get('Raven').captureException(error)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    
    app.post '/apis/dealFromJotApplication', (req, res)->
      extractedData=req.body; 
      wagner.get('CarsDirectRequestManager').storeCarsDealFromJotApplication(extractedData).then((carsdata) ->
        res.status(HTTPStatus.OK).json
          success:'1'
          message: 'success'
          data: carsdata
      ).catch (e) ->
        wagner.get('Raven').captureException(e)
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
          success:'0'
          message: constants.error_messages['Default']

    app.post '/apis/createZimbraUser', (req, res) =>
      info = req.body
      wagner.get('UserManager').createZimbraUser(info.data).then (result) =>
        res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: result
      .catch (error) =>
          wagner.get('Raven').captureException(error)
          res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
            success:'0'
            message: constants.error_messages['Default']
    
    app.post '/apis/downloadFileForms3', (req, res) => 
      info = req.body
      wagner.get('UserManager').encryptFile(info).then (result) -> 
        res.status(HTTPStatus.OK).json 
          success: '1' 
          message: 'success' 
          data: result 
      .catch (error)=> 
        console.log error


    app.get '/apis/health', (req, res) => 
      wagner.get('HealthCheckManager').check().then (result) -> 
        res.status(HTTPStatus.OK).json 
          status: 'success' 
          message: 'Database connection is healthy' 
      .catch (error)=> 
        res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
          status: 'fail' 
          message: 'Database connection error' 

    app.post '/apis/setBlockedBrands', (req, res) =>
      wagner.get('BrandsManager').setBlockedBrands().then (result) -> 
        res.status(HTTPStatus.OK).json 
          success: '1' 
          message: 'success' 
          data: result 
      .catch (error)=> 
        console.log error


    app.post '/apis/getPortalUsers', (req, res) =>
        wagner.get('ContactOwnerManager').getContactOwnerList('Direct').then (result) -> 
          res.status(HTTPStatus.OK).json 
            success: '1' 
            message: 'success' 
            data: result 
        .catch (error)=> 
          console.log error


    app.post '/apis/generateContactReferralFromPortal', (req, res)->
      info = req.body
      data = null
      if info
        contactId = info.id
        data =
          firstname: info.first_name
          lastname: info.last_name
      
        randomNumber = Math.floor(Math.random()*(999-100+1)+100)
        if data.firstname.length > 2
          data.firstname = data.firstname.substr(0,3)
        else
          data.firstname = data.firstname + Math.floor(Math.random()*(999-100+1)+100)
          data.firstname = data.firstname.substr(0,3)

        if data.lastname.length > 2
          data.lastname = data.lastname.substr(0,3)
        else
          data.lastname = data.lastname + Math.floor(Math.random()*(999-100+1)+100)
          data.lastname = data.lastname.substr(0,3)

        generatedReferralURL = config.webUrl + "/" + (data.firstname + data.lastname + randomNumber).toLowerCase()
        wagner.get('UserManager').updateHubspotContactReferralFromPortal(generatedReferralURL, contactId).then (result) =>
          res.status(HTTPStatus.OK).json
            success: '1'
            message: 'success'
            data: result
        .catch (error)=>
            res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json
              success: '0'
              error: error
              message: constants.error_messages['Default']
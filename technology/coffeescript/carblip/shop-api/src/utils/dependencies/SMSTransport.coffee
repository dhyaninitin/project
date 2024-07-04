EventEmitter = require('events').EventEmitter
Promise = require('bluebird')
config = require('../../config')
base64 = require('base-64')
mandrill = require('mandrill-api/mandrill')
mandrill_client = new (mandrill.Mandrill)(config.mandrill.apikey)
formatCurrency = require('format-currency')
phoneFormatter = require('phone-formatter')
moment = require('moment-timezone')
helper = require('../helper');
constants = require('../../core/constants');

class SMSTransport extends EventEmitter

    SMS_SUCCESS:"SmsSuccessEvent"
    SMS_FAILURE:"SmsFailureEvent"

    constructor: (@wagner) ->
      @config=@wagner.get('config')
      
      @twilio=@wagner.get('twilio')

      # logging events for debug
      @.on @SMS_SUCCESS,(eventDetails)=>
        console.log JSON.stringify
          eventType:'smsEvent',
          payload:eventDetails.payload,
          "SMS event Success"

      @.on @SMS_FAILURE,(eventDetails)=>
        console.log JSON.stringify
          eventType:'smsEvent',
          error:eventDetails.error,
          payload:eventDetails.payload,

    send:(options, callback) =>
      return new Promise ( resolve, reject ) =>
        payload = 
          type: ['carrier']
        @twilio.lookups.phoneNumbers(options.to).fetch(payload).then (result)=>
          carrier = result.carrier;
          if not carrier
            reject {
              type: 1
            }
          else
            if carrier.type != 'landline'
              payload=
                to:options.to
                messagingServiceSid:config.twilio.messageServiceId
                body:options.message
              if process.env.NODE_ENV != 'localhost'
                payload['statusCallback'] = config.apiUrl + '/apis/smsCallback'

              @twilio.messages.create(payload).then (result)=>
                @emit @SMS_SUCCESS, {payload:options}
                resolve result
              .catch (err) =>
                @emit @SMS_FAILURE, {error:err,payload:options}
                reject err
            else
              reject {
                type: 2
              }
        .catch (err) =>
          reject {
            type: 1
          }

module.exports = SMSTransport

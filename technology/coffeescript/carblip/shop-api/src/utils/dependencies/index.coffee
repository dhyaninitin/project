#require external dependencies required like newrelic,redis,datadog etc
config = require('../../config')
Twilio = require "twilio"
SMSTransport=require "./SMSTransport"
EmailTransport=require "./EmailTransport"
KinesisTransport=require "./KinesisTransport"
SQSTransport=require "./SQSTransport"
IPlocator=require "./IPlocator"
ImageUploadAws=require "./ImageUploadAws"
Deeplinker=require "./Deeplinker"

module.exports = (wagner,sequelize) ->

    wagner.factory 'config', () ->
        return config

    wagner.factory 'twilio', () ->
        return Twilio(config.twilio.accountSid, config.twilio.authToken)

    wagner.factory 'SMSTransport', () ->
        return new SMSTransport(wagner)

    wagner.factory 'KinesisTransport', () ->
        return new KinesisTransport(wagner)

    wagner.factory 'SQSTransport', () ->
        return new SQSTransport(wagner)

    wagner.factory 'IPlocator', () ->
        return new IPlocator(wagner)

    wagner.factory 'Deeplinker', () ->
        return new Deeplinker(wagner)

    wagner.factory 'EmailTransport', () ->
        return new EmailTransport(wagner)

    wagner.factory 'ImageUploadAws', () ->
        return new ImageUploadAws(wagner)

AWS = require('aws-sdk')
Promise = require('bluebird')
md5 = require('md5')
moment = require('moment-timezone')
_ = require('underscore')
config = require('../../config')
async=require('async')

class SQSTransport

    constructor: () ->
      @sqs = new AWS.SQS({
        region: 'us-east-1',
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      })

    sendMessage:(payload,queue,delaySeconds,callback) =>
      queueUrl = config.sqs.url + config.sqs.queues[queue]
      params=
        QueueUrl:queueUrl
        MessageBody:payload
        DelaySeconds:delaySeconds

      console.log('SQS send:', queueUrl);
      @sqs.sendMessage params,(err,data)=>
        if err?
          console.log('SQS error', err);
          callback(err,null)
        else
          callback(null,data)

    sendFifoMessage:(payload,queueUrl,messageGroupId,callback) =>
      params=
        QueueUrl:queueUrl
        MessageBody:payload
        MessageGroupId: messageGroupId
      @sqs.sendMessage params,(err,data)=>
        if err?
          callback(err,null)
        else
          callback(null,data)

    sendMessageBatch:(entries,queueUrl,callback) =>
      params=
        QueueUrl:queueUrl
        Entries:entries
      @sqs.sendMessageBatch params,(err,data)=>
        if err?
          callback(err,null)
        else
          callback(null,data)

module.exports = SQSTransport

EventEmitter = require('events').EventEmitter
AWS = require('aws-sdk')

class KinesisTransport extends EventEmitter

    KINESIS_STREAM_SUCCESS:"KinesisSuccessEvent"
    KINESIS_STREAM_FAILURE:"KinesisFailureEvent"

    constructor: (@wagner) ->
        @kinesis = new AWS.Kinesis()
        @Raven=@wagner.get('Raven')
        
        @.on @KINESIS_STREAM_SUCCESS,(eventDetails)=>
            console.log JSON.stringify
                msg:"Event processed successfully!"
                eventType:@KINESIS_STREAM_SUCCESS
                eventStream:eventDetails.StreamName
                payload:eventDetails.payload

        @.on @KINESIS_STREAM_FAILURE,(eventDetails)=>
            @Raven.captureException eventDetails.error

    send:(event) =>
        params=
            StreamName:event.stream
            Data: JSON.stringify event.payload
            PartitionKey:'event-' + Math.floor(Math.random() * 10000000) + '-' + Date.now()

        @kinesis.putRecord params,(err,data)=>
            if err?
              @emit @KINESIS_STREAM_FAILURE, {error:error,StreamName:event.stream,payload:event.payload}
            else
              @emit @KINESIS_STREAM_SUCCESS, {StreamName:event.stream,payload:event.payload}


module.exports = KinesisTransport

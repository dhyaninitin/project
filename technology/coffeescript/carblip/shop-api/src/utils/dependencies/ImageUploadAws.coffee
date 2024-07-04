request = require('request')
Promise = require('bluebird')
AWS = require('aws-sdk')
config = require('../../config')
helper = require('../helper');
async = require 'async'


AWS.config.update config.aws

s3 = new (AWS.S3)(params: Bucket: config.AWS_S3_BUCKET)    

class ImageUploadAws

    constructor: (@wagner) ->

    _apiCall:(options,callback)=>
        request options, (error, response, body) =>
            if !error and [ 200, 204, 201 ].indexOf( response.statusCode ) != -1
                try
                    data = JSON.parse(body)
                catch error
                    data = body
                callback(null,data)
            else
                callback(error,null)

    uploadImage:(url,pathUrl) =>
        return new Promise (resolve, reject) =>
            options=
                url: url
                encoding: null

            @_apiCall options,(error,image_data)=>
                if error?
                    reject error
                else
                    helper.uploadS3Image image_data, pathUrl, (error,result)=>
                        if error?
                            reject error
                        resolve result

    uploadCroppedImage:(url,pathUrl) =>
        return new Promise (resolve, reject) =>
            async.waterfall [
                # crop image
                (callback)=>
                    helper.cropImageWaterMark url,(error,image_data)=>
                        callback error,image_data
                # upload s3
                (image_data,callback)=>
                    path = url.split('https://i.fuelapi.com/0b144c567599432a819f91da5ce4753a/')[1]
                    index = path.lastIndexOf('.png')
                    url = path.substring(0, index) + '-cropped' + path.substring(index)
                    helper.uploadS3Image image_data,url,(error,result)=>
                        callback error, result
            ],(error,result)=>
                if error?
                    reject error
                else
                    resolve result

module.exports = ImageUploadAws

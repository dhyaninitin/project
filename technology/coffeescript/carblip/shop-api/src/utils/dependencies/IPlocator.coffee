request = require('request')
Promise = require('bluebird')

class IPlocator

    constructor: (@wagner) ->
        @baseUrl = "http://ip-api.com/json"

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

    fetchLocation:(ip) =>
        return new Promise (resolve, reject) =>
            options=
                url: @baseUrl+"/"+ip

            @_apiCall options,(error,result)=>
                if error?
                    reject error
                else
                    resolve result



module.exports = IPlocator

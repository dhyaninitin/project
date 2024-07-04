request = require("request")
config = require('../../config')
class Deeplinker

  constructor: (@wagner) ->
    @baseUrl = "https://api.branch.io/v1/url"
    @config=@wagner.get('config')
    

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

  getDeepLink:(email, verifyLink,login_verify_code) =>
    return new Promise (resolve, reject) =>
        options=
          method: 'POST'
          url: @baseUrl
          headers:
            'Content-Type': 'application/json'
          body:
            branch_key: config.branchio.key
            data:
              '$fallback_url': verifyLink
              custom_object:
                login_key: login_verify_code
                email: email
                deeplink_type:'login'
          json: true

        @_apiCall options,(error,result)=>
            if error?
                reject error
            else
                resolve result

module.exports = Deeplinker

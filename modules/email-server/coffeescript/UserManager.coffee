Promise = require('bluebird')
config = require('../config')
zimbra = require("zimbra-client")

class UserManager

    constructor: (@wagner) ->
        
        @user=@wagner.get('User')

    createZimbraUser:(body)=>
        return new Promise (resolve, reject) =>
            givenName = body.first_name + " " + body.last_name
            zimbra.getAdminAuthToken(config.zimbraConfiguration.zimbra_host, 
            config.zimbraConfiguration.admin_login, 
            config.zimbraConfiguration.admin_password, then((err,authToken)=>
                if err
                    reject err
                else
                    zimbra.createAccount(config.zimbraConfiguration.zimbra_host,{sn:body.first_name,givenName:givenName,displayName:givenName,password:body.password,name:body.email},authToken, then((err1,accountObj) =>
                        if err1
                            reject err1
                        else
                            if !accountObj
                                reject 'An account with this name already exists'
                            else
                                resolve accountObj
                    ))
            ))

module.exports = UserManager

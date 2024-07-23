Promise = require('bluebird')
config = require('../config')
md5 = require('md5')
async=require 'async'
_ = require 'underscore'
uuidv1 = require('uuid/v1')
moment = require('moment')
crypto = require('crypto')
math = require('mathjs')
request = require('request')
secret = 'abcdefg'
algorithm = 'aes256'
key = 'password'
{ google } = require('googleapis')
fs = require('fs')
http = require('http')
helper = require('../utils/helper')
CryptoJS = require("crypto-js")
zimbra = require("zimbra-client")
generateSequelizeOp = helper.generateSequelizeOp

class UserManager

    constructor: (@wagner) ->
        
        @user=@wagner.get('User')
        @phoneOtp=@wagner.get('PhoneOtps')
        @userWorkHistory=@wagner.get('UserWorkHistory')
        @userLeaseInformation=@wagner.get('UserLeaseInformation')
        @userEducation=@wagner.get('UserEducation')
        @UserSessions=@wagner.get('UserSessions')
        @contactOwnerManager = @wagner.get('ContactOwnerManager')

        @HubspotManager=@wagner.get('HubspotManager')

    _apiCall:(options,callback)=>
        request options, (error, response, body) =>
            if !error
                try
                    data = JSON.parse(body)
                catch error
                    data = body
                callback(null,data)
            else
                callback(error,null)

    fetchAll:()=>
        return new Promise (resolve, reject) =>
            @user.findAll().then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    fetchByEmail:(email)=>
        return new Promise (resolve,reject) =>
            query=
                where:
                    email_address:email
            @user.findAll(query).then (result)=>
                 if not result or result.length <= 0
                    resolve null
                 else
                    resolve result
            .catch (error)=>
                reject error

    fetchAllConEmails:()=>
        return new Promise (resolve, reject) =>
            query=
                where:
                    email_address: generateSequelizeOp 'like', "%.con"
            @user.findAll(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)    

    ###
    # Get all user where id is greater than 
    # @param id: number
    # @return userlist
    ###

    fetchAllGtId:(id)=>
        return new Promise (resolve, reject) =>
            @user.findAll({ where: { id : generateSequelizeOp('gte', id)} }).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)

    findUsersWithoutHubspotPhone: (contacts) =>
        return new Promise (resolve, reject) =>
            emails = _.map contacts, (item) =>
                item.properties.email
            query=
                where:
                    email_address: generateSequelizeOp 'in', emails
                    phone: generateSequelizeOp 'ne', null

            @user.findAll(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)        

    upsertUser:(options)->
        return new Promise (resolve, reject) =>
            @user.findOrCreate({where: {facebook_id: options.facebook_id, email_address: options.email_address}, defaults: options}).then (user, created) =>
                if created
                    resolve user[0]
                else
                    user[0].set(options).save()
                    .then (updatedUser)->
                        resolve updatedUser
            .catch (error) ->
                reject(error)

    createPhoneOtp: (options)->
        return new Promise (resolve, reject) =>
            updates =
                phone: options.phone
                otp: math.floor math.random() * 89999 + 10000
                is_verified: 0

            @phoneOtp.findOrCreate({ where: { phone: options.phone }, defaults: updates })
            .then (obj, created) ->
                if created
                    resolve obj
                else
                    obj[0].update(updates)
                    .then (updated) ->
                        resolve updated
            .catch (error) ->
                reject(error)
    
    checkPhoneOtp: (options)->
        query =
            where:
                phone: options.phone
                otp: options.otp
                is_verified: 0
        return new Promise (resolve, reject) =>
            @phoneOtp.findOne(query).then (obj) =>
                resolve obj
            .catch (error) ->
                reject(error)
    
    updatePhoneOtp: (options)->
        otp = math.floor(math.random()*89999+10000)
        updates = 
            phone: options.phone
            otp: otp
            is_verified: 0
        
        return new Promise (resolve, reject) =>
            @phoneOtp.update(updates, {where: phone: options.phone}).then (obj) =>
                resolve obj
            .catch (error) ->
                reject(error)
    
    findPhoneOtpById: (id)->
        query =
            where:
                id: id
        return new Promise (resolve, reject) =>
            @phoneOtp.findOne(query).then (obj) =>
                resolve obj
            .catch (error) ->
                reject(error)

    createUser: (options)->
        return new Promise (resolve, reject) =>
            @user.create(options).then (user) =>
                resolve user
            .catch (error) ->
                reject error

    phoneUserUpdate:(options, user)->
        return new Promise (resolve, reject) =>
            if !user
                @user.findOrCreate({where: {phone: options.phone}, defaults: options}).then (user, created) =>
                    if created
                        resolve user[0]
                    else
                        user[0].set(options).save()
                        .then (updated)->
                            resolve updated
                .catch (error) ->
                    reject(error)
            else
                user.set(options).save().then ()->
                    resolve user
                .catch (error) ->
                    reject(error)

    phoneUser:(options)->
        return new Promise (resolve, reject) =>
            @user.findOrCreate({where: {phone: options.phone}, defaults: options}).then (user, created) =>
                if created
                    resolve user[0]
                else
                    user[0].set(options).save()
                    .then (updated)->
                        resolve updated
            .catch (error) ->
                reject(error)

    emailUser:(options,host)->
        return new Promise (resolve, reject) =>
            options.password = md5(options.password)
            @user.findOrCreate({where: {email_address: options.email_address}, defaults: options}).then (user, created) =>
                if created
                    @subscribeMailchimp(options)
                    resolve user[0]
                else
                    reject 'Email Already Exits.Please Login'
            .catch (error) ->
                reject(error)

    subscribeMailchimp:(options) =>
        return new Promise ( resolve, reject ) =>
            payload=
                email_address:options.email_address
                status:'subscribed'
                merge_fields:
                    FNAME:options.first_name
                    LNAME:options.last_name
            @wagner.get('MailChimp').post('/lists/'+config.mailchimp.listId+'/members',payload).then (result)=>
                resolve true
            .catch (error)=>
                reject error

    findById:(id)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    id: id
                include:
                    [
                        {
                            model: @wagner.get('UserEducation')
                        },
                        {
                            model: @wagner.get('UserWorkHistory')
                        }
                    ]
            @user.findOne(query).then (user)=>
                resolve user
            .catch (error)=>
                reject error

    userExits:(email,host)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    email_address: email
            @user.findOne(query).then (user)=>
                if !user
                    reject 'User does not exist'
                else
                    time = Date.now() + 3600000
                    cipher = crypto.createCipher(algorithm, key)
                    encrypted = cipher.update(email + '/' + time, 'utf8', 'hex') + cipher.final('hex')
                    wagner.get('EmailTransport').forgotPasswordEmail(email,user.first_name,encrypted,host)
                    resolve 'Mail sent'
            .catch (error)=>
                reject error

    loginUser:(options)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    email_address: options.email_address
            @user.findOne(query).then (user)=>
                if !user
                    reject 'User does not exist'
                else if md5(options.password) != user.password
                    reject 'Oops! Wrong Password'
                else if user.status != 1
                    reject 'Please Verify your Account'
                else
                    resolve user
            .catch (error)=>
                reject error

    checkResetPassword:(token)=>
        return new Promise (resolve, reject) =>
            decipher = crypto.createDecipher(algorithm, key)
            decrypted = decipher.update(token, 'hex', 'utf8') + decipher.final('utf8')
            string = decrypted.split('/')
            email = string[0]
            time = string[1]
            if  Date.now() > time
                return reject('Link has been expired')
            query =
                where:
                    email_address: email
            @user.findOne(query).then (user)=>
                if !user
                    reject 'User does not exist'
                else
                    resolve email
            .catch (error)=>
                reject error

    resetPassword:(password,token)=>
        return new Promise (resolve, reject) =>
            password = md5(password)
            decipher = crypto.createDecipher(algorithm, key)
            decrypted = decipher.update(token, 'hex', 'utf8') + decipher.final('utf8')
            string = decrypted.split('/')
            email = string[0]
            @user.update({password: password}, { where: { email_address: email }}).then (user)=>
                if !user
                    reject 'User does not exist'
                else
                    resolve user
            .catch (error)=>
                reject error

    verifyUser:(token)=>
        return new Promise (resolve, reject) =>
            decipher = crypto.createDecipher(algorithm, key)
            decrypted = decipher.update(token, 'hex', 'utf8') + decipher.final('utf8')
            @user.update({status: 1}, { where: { email_address: decrypted }}).then (user)=>
                if !user
                    reject 'User does not exist'
                else
                    resolve user
            .catch (error)=>
                reject error

    updateDeviceToken:(user_id, device_token)=>
        return new Promise (resolve, reject) =>
            @user.update({device_token: device_token}, { where: { id: user_id }}).then (user)=>
                if !user
                    reject 'User does not exist'
                else
                    resolve user
            .catch (error)=>
                reject error

    bulkUpsertEducation:(education,userId)=>
        _.each education,(edu)=>
            options=
                user_id:userId
                facebook_id:edu.id
                year:if edu.year? then edu.year.name else null
                school_name:edu.school.name
                type:edu.type
                concentration_name: if edu.concentration?.length>0 then edu.concentration[0].name else null

            @upsertEducation(options)

    upsertEducation:(options)=>
        return new Promise (resolve, reject) =>
            @userEducation.findOrCreate({where: {facebook_id: options.facebook_id}, defaults: options}).then (userEducation, created) =>
                if created
                    resolve userEducation[0]
                else
                    userEducation[0].set(options).save()
                    .then (updated)=>
                        resolve updated
            .catch (error) =>
                reject(error)

    bulkUpsertWorkHistory:(workHistory,userId)=>
        _.each workHistory,(work)=>
            options=
                user_id:userId
                facebook_id:work.id
                start_date:if work.start_date? then work.start_date else null
                end_date:if work.end_date? then work.end_date else null
                employer_name:if work.employer? then work.employer.name else null
                position:if work.position? then work.position.name else null

            @upsertWorkHistory(options)

    upsertWorkHistory:(options)=>
        return new Promise (resolve, reject) =>
            @userWorkHistory.findOrCreate({where: {facebook_id: options.facebook_id}, defaults: options}).then (userWorkHistory, created) =>
                if created
                    resolve userWorkHistory[0]
                else
                    userWorkHistory[0].set(options).save()
                    .then (updated)=>
                        resolve updated
            .catch (error) =>
                reject(error)

    phoneExists:(options)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    phone: options.phone
            @user.findOne(query).then (user)=>
                if user
                    resolve user
                else
                    resolve false
            .catch (error)=>
                reject error

    emailExists:(options)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    email_address: options.email_address
            @user.findOne(query).then (user)=>
                if user
                    resolve user
                else
                    resolve false
            .catch (error)=>
                reject error

    createSession:(user)->
        return new Promise (resolve, reject) =>
            options={}
            options.user_id = user.id
            uuid = uuidv1()
            options.utoken = uuid
            options.expiry = moment.utc().add(config.session_timeout_value,config.session_timeout_unit).unix()
            @UserSessions.create(options).then (user_session) =>
                resolve { user_session: user_session }
            .catch (error) ->
                reject error

    getToken:(token)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    utoken: token
            @UserSessions.findOne(query).then (user_session)=>
                if !user_session
                    resolve false
                else 
                    resolve user_session
            .catch (error)=>
                reject error

    refreshToken: (token)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    utoken: token
            newExpiry= moment().utc().add(config.session_timeout_value,config.session_timeout_unit).unix();
            @UserSessions.update({expiry: newExpiry}, query).then (session)=>
                if !session
                    resolve false
                else
                    resolve session
            .catch (error)=>
                reject error
            
    getProfile:(token)=>
      return new Promise (resolve,reject) =>
        @getToken(token).then (user_session)=>
            @user.findOne({where: id: user_session.user_id}).then (user) =>
                if !user
                    resolve false
                else
                    resolve user
        .catch (error)=>
            reject error

    updateProfile: (user_id, payload)=>
        return new Promise (resolve,reject) =>
            if payload.password
                payload.password = md5(payload.password)
            if payload.phone
                payload.phone_verified = 0
            @user.update(payload, { where: { id: user_id }}).then (user)=>
                if !user
                    reject 'An error occured'
                else
                    resolve user
            .catch (error)=>
                reject error

    updateProfileByEmail: (email, payload)=>
      return new Promise (resolve,reject) =>
        if payload.password
            payload.password = md5(payload.password)
        if payload.phone
            payload.phone_verified = 0
        @user.update(payload, { where: { email_address: email }}).then (user)=>
            if !user
                reject 'An error occured'
            else
                resolve user
        .catch (error)=>
            reject error

    updateVerifyCode: (payload)=>
      return new Promise (resolve,reject) =>
        @user.update({login_verify_code: payload.login_verify_code}, { where: { email_address: payload.email_address }}).then (user)=>
            if !user
                reject 'An error occured'
            else
                resolve user
        .catch (error)=>
            reject error

    getUserById:(id)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    id: id
            @user.findOne(query).then (user)=>
                if !user
                    resolve false
                else
                    resolve user
            .catch (error)=>
                reject error

    checkToken:(query)=>
        return new Promise (resolve, reject) =>
            @user.findOne(query).then (user)=>
                if !user
                    resolve false
                else
                    resolve user
            .catch (error)=>
                reject error

    checkUserExists:(email)=>
        return new Promise (resolve, reject) =>
            @user.findOrCreate({ where: { email_address: email }}).then (user, created)=>
                if created
                    @createSession(user)
                    resolve user[0]
                else
                    @user.findOne({ where: { email_address: email }}).then (user)=>
                        @createSession(user)
                        resolve user
            .catch (error)=>
                reject error

    sendSMS:(user_id, phone)=>
        return new Promise (resolve, reject) =>
            otp = math.floor(math.random()*89999+10000)
            message = 'Your Automotive verification code is: ' + otp
            smsPayload=
              message:message
              to:phone
            wagner.get('SMSTransport').send(smsPayload).then (result) =>
                options = 
                    otp_tmp: otp
                    phone_tmp: phone
                @user.update(options, {where: {id: user_id}}).then (user)=>
                    resolve user
                .catch (error)=>
                    reject error
            .catch (error) =>
                reject error

    sendSMSOtp:(phone, otp)=>
        return new Promise (resolve, reject) =>
            message = 'Your Automotive verification code is: ' + otp
            smsPayload=
              message:message
              to:phone
            wagner.get('SMSTransport').send(smsPayload).then (result) =>
                resolve result
            .catch (error) =>
                reject error

    trackUserInterest: (options) =>
        return new Promise (resolve, reject) =>
            payload =
                email_address: options.email_address
                status: 'subscribed'
                merge_fields:
                    ZIP_INTRST: options.zip

            options=
                url: config.mailchimp.apiUrl + '/lists/' + config.mailchimp.list_id + '/members'
                method: 'POST',
                headers:
                    Authorization: 'Basic ' + Buffer.from('anything:' + config.mailchimp.apiKey).toString('base64')
                body: JSON.stringify(payload)

            @_apiCall options,(error,result)=>
                if error
                    reject error
                else
                    resolve result

    createUserLeaseInformation: (options) =>
        return new Promise (resolve, reject) =>

            leaseInformation = 
                will_trade: null
                year: null
                brand_id: null
                model_id: null
                miles: null
                term_in_months: null
                down_payment: null
                annual_milage: null
            
            leaseInformation.user_id = options.user_id

            if options.user_car_information && options.user_car_information.will_trade
                leaseInformation.will_trade = options.user_car_information.will_trade
                
            if options.user_car_information && options.user_car_information.year
                leaseInformation.year = options.user_car_information.year
            
            if options.user_car_information && options.user_car_information.brand_id
                leaseInformation.brand_id = options.user_car_information.brand_id
            
            if options.user_car_information && options.user_car_information.model_id
                leaseInformation.model_id = options.user_car_information.model_id

            if options.user_car_information && options.user_car_information.miles
                leaseInformation.miles = options.user_car_information.miles

            if options.user_car_information && options.user_car_information.term_in_months
                leaseInformation.term_in_months = options.user_car_information.term_in_months

            if options.user_car_information && options.user_car_information.down_payment
                leaseInformation.down_payment = options.user_car_information.down_payment

            if options.user_car_information && options.user_car_information.annual_milage
                leaseInformation.annual_milage = options.user_car_information.annual_milage

            if options.credit_score
                leaseInformation.credit_score = options.credit_score
            
            if options.buying_time
                leaseInformation.buying_time = options.buying_time
            
            if options.buying_method
                leaseInformation.buying_method = options.buying_method

            query =
                where:
                    user_id: options.user_id

            @userLeaseInformation
                .findOne(query)
                .then (userLease) =>
                    if userLease
                        userLease
                            .update(leaseInformation)
                            .then (result) =>
                                resolve result
                    else
                      @userLeaseInformation
                          .create(leaseInformation)
                          .then (userLease)=>
                              @user.update({lease_captured: 1}, { where: { id: options.user_id }}).then (user)=>
                                  resolve user
            .catch (error) =>
                reject error

    getUserLeaseInformation: (options) =>
        return new Promise (resolve, reject) =>
            query =
                where:
                    user_id: options.user_id
                include: [{
                  model: @wagner.get('Brands')
                  attributes: ['id', 'name']
                }, {
                  model: @wagner.get('Models')
                  attributes: ['id', 'name']
                }]

            @userLeaseInformation.findOne(query).then (userLease)=>
                resolve userLease
            .catch (error) =>
                reject error

    logout: (payload)=>
      return new Promise (resolve,reject) =>
        query =
            where:
                utoken: payload.token
        @UserSessions.findOne(query).then (session)=>
            @UserSessions.destroy(query).then (result)=>
                resolve result
            .catch (error)=>
                reject(error)
        .catch (error)=>
            resolve 'no session'

    updateAppVersion: (payload)=>
      return new Promise (resolve,reject) =>
        @getToken(payload.token).then (user_session)=>
            if !user_session
                reject 'User does not exist'
            else
                @user.update({app_version: payload.app_version}, { where: { id: user_session.user_id }}).then (result)=>
                    if !result
                        reject 'Something went wrong'
                    else
                        resolve payload.app_version
        .catch (error)=>
            reject error

    getAppVersion: (payload)=>
      return new Promise (resolve,reject) =>
        @getToken(payload.token).then (user_session)=>
            if !user_session
                reject 'User does not exist'
            else
                @user.findOne({ where: id: user_session.user_id }).then (user)=>
                    if !user
                        reject 'Something went wrong'
                    else
                        resolve user.app_version
        .catch (error)=>
            reject error

    getUserIdByToken: (token)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    utoken: token
                attributes: ['user_id']

            @UserSessions.findOne(query).then (userSession)=>
                resolve userSession.user_id
            .catch (error)=>
                reject error


    getDriveFiles: (fileInfo, callback)=> 
        return new Promise (resolve, reject)=> 
            oauth2Client = new google.auth.OAuth2(
                config.googleOAuthCreds.JOTFORM_CLIENT_ID,
                config.googleOAuthCreds.JOTFORM_CLIENT_SECRET,
                config.googleOAuthCreds.JOTFORM_REDIRECT_URI 
            )

            oauth2Client.setCredentials({ refresh_token: config.googleOAuthCreds.JOTFORM_REFRESH_TOKEN});

            driveService = google.drive({
                version: 'v3',
                auth: oauth2Client
            })
            query = "name=\'#{fileInfo.filename}.pdf\'"
            res = driveService.files.list({
                q: query,
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive',
            })
            .then((res)=> 
                if res.data.files.length == 1
                    fileId = res.data.files[0].id
                    driveService.files.get(
                        { fileId, alt: 'media' },
                        { responseType: 'stream' }
                    )
                    .then((res) =>
                        buf = []
                        res.data
                        .on('end', () =>
                            buffer = Buffer.concat(buf)
                            s3FolderPath = "test/test/#{fileInfo.filename}.pdf"
                            helper.generatePgpKey fileInfo.name, fileInfo.email, buffer, s3FolderPath ,(error,result)=>
                                secretManagerPayload =
                                    description: ''
                                    secretname: "clientfile/#{result.passPhrase}"
                                    secret: 
                                        privatekey: CryptoJS.AES.encrypt(result.privateKey, result.passPhrase).toString()
                              
                                helper.setKeyAWSSecretManager secretManagerPayload, (error, response)->
                                    resolve result
                            console.log('Done downloading file.')
                        )  
                        .on('error', (err) =>
                            console.error('Error downloading file.')
                        )
                        .on('data', (d) =>
                            buf.push(d);
                        )
                        # .pipe(dest);
                    )
                    # resolve res
                else
                    # resolve res
            )

    getFile: (fileInfo)=> 
        return new Promise (resolve, reject)=> 
            # filepath = "test/test/#{fileInfo.filepath}.pdf"
            filepath = fileInfo.filepath
            passPhrase = fileInfo.passphrase
            helper.getSignedUrl filepath ,(error, result)=>
                fileUrl = result
                fileUrl = fileUrl.replace('https', 'http')
                request = http.get(fileUrl, (response) ->
                    response.setEncoding('utf8')
                    data = ""
                    response.on 'data', (d) ->
                        data += d
                    response.on 'end', ->
                        console.log 'File Download Completed'
                        secretManagerPayload = 
                            secretname: fileInfo.secretname

                        helper.getKeyAWSSecretManager secretManagerPayload, (error, response)=>
                            if error
                                console.log "Error: ", error
                            else
                                encryptedKey = CryptoJS.AES.decrypt(response.privatekey, passPhrase)
                                decryptedPrivateKey = encryptedKey.toString(CryptoJS.enc.Utf8)
                                helper.pgpDecrypt decryptedPrivateKey, passPhrase, data ,(error,result)=>
                                    resolve result
                        return
                    return
                ) 

    encryptFile: (body) =>
        return new Promise (resolve, reject)=>
            s3FolderPath = 'test/'+body.data.foldername+'/'+body.data.filename
            url = body.data.url 
            email = body.data.email 
            name = body.data.name 
            request = http.get(url, (res) ->
                buf = []
                res.on 'data', (chunk) ->
                    # buf += chunk;
                    buf.push(chunk)

                res.on 'end', () ->
                    buffer = Buffer.concat(buf)
                    helper.generatePgpKey name, email, buffer, s3FolderPath ,(error,result)=>
                        secretManagerPayload =
                            description: ''
                            secretname: "email/#{result.passPhrase}"
                            secret: 
                                privatekey: CryptoJS.AES.encrypt(result.privateKey, result.passPhrase).toString()
                        
                        helper.setKeyAWSSecretManager secretManagerPayload, (error, response)->
                            resolve result
                    console.log('Done downloading file.')
            )

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
    
    # Get user details by Email
    getUserByEmail:(email)=>
        return new Promise (resolve, reject) =>
            query =
                where:
                    email_address: email
            @user.findOne(query).then (user)=>
                if !user
                    resolve false
                else
                    resolve user
            .catch (error)=>
                reject error

    updateFromHubspot: (options) =>
        email_address = options.email_address
        updates = {}
        if options.first_name
            updates.first_name = options.first_name
        if options.last_name
            updates.last_name = options.last_name
        if options.phone
            updates.phone = options.phone

        return new Promise (resolve,reject) =>
            @HubspotManager.getContactOwnerById(options.hubspot_owner_id).then (owner) =>
                if owner
                    updates.contact_owner_email = owner.email
                @emailExists({email_address: email_address}).then (is_exits) => 

                    if is_exits
                        if is_exits.contact_owner_email != updates.contact_owner_email
                            # START OF Contact Owner update LOGS CREATION
                            logString = "#{updates.first_name} #{updates.last_name} was updated with contact owner #{owner.firstName} #{owner.lastName} from Hubspot"
                            wagner.get('CPortaluserManager').userLogs({id:is_exits.id, logString:logString}, 'updated', '', {}).then(
                                (logres)=> console.log "final log res", logres
                                (error)=> console.log error)
                            # END OF LOGS CREATION    
                        @user.update(updates, { where: { email_address: email_address }}).then (result)=>
                            if !result
                                reject 'Something went wrong'
                            else
                                # Update Type Concierge for contact
                                # wagner.get('HubspotManager').checkAndUpdateTypeForContact(email_address)
                                resolve result
                        .catch (error)=>
                            reject error
                    else
                        newUser = _.extend(updates, {
                            email_address: email_address,
                            status: 1
                        });

                        if options.phone
                            newUser = _.extend(newUser, {
                              phone_verified: 1
                            });   
                        @user.create(newUser).then (result)=>
                            if !result
                                reject 'Something went wrong'
                            else
                                # START OF REGISTER USER FROM HUBSPOT LOGS CREATION
                                logString = "#{updates.first_name} #{updates.last_name} was registered by Hubspot"
                                wagner.get('CPortaluserManager').userLogs({id:result.id, logString:logString}, 'register', '', {}).then(
                                    (logres)=> console.log "final log res", logres
                                    (error)=> console.log error)
                                # END OF LOGS CREATION
                                # Update Type Concierge for contact
                                # wagner.get('HubspotManager').checkAndUpdateTypeForContact(email_address)
                                resolve result
                        .catch (error)=>
                            reject error


    updateHubspotContactReferralFromPortal: (generatedReferralURL, contactId) =>
      return new Promise (resolve, reject) =>
        @user.update({concierge_referral_url: generatedReferralURL}, { where: { id: contactId }}).then (user)=>
            resolve user    

    updateHubspotContactId: (hubspotContactId, contact_email) =>
      return new Promise (resolve, reject) =>
        if hubspotContactId
            @user.update({hubspot_contact_id: hubspotContactId}, { where: { email_address: contact_email }}).then (contact)=>
                resolve contact
        else
            reject null  

    leadAssignmentAndSendEmail: (options, requestType = null) =>
      return new Promise (resolve, reject) =>
        sourceForContactOwnerAssignment = options.source_utm
        @wagner.get('HubspotManager').getPortalUserByPromoCode(options.referral_code).then((portal_user) =>
            console.log "getPortalUserByPromoCode -->", portal_user;
            if Object.keys(portal_user).length
                update= 
                    contact_owner_email: portal_user.email
                @updateProfile(options.user_id, update)
            else
                @getContactOwnerEmailByContactEmail(options.email_address).then((user) =>
                    if user && user.contact_owner_email
                        update= 
                            contact_owner_email: user.contact_owner_email
                        @updateProfile(options.user_id, update).then (user) =>
                            if requestType == null
                                options.id = options.request_id
                                @generateUserAndDealLogs(options, sourceForContactOwnerAssignment)

                    else
                        @getLastUser().then (lastUserDetails) =>
                            console.log("Emaill ", lastUserDetails.contact_owner_email)
                            @contactOwnerManager.getAvilableContactOwnerEmail( lastUserDetails.contact_owner_email, sourceForContactOwnerAssignment).then((user) =>
                                update= 
                                    contact_owner_email: user
                                console.log('userID',options.user_id)
                                @updateProfile(options.user_id, update).then (user) =>
                                    if requestType == null
                                        options.id = options.request_id
                                        @generateUserAndDealLogs(options, sourceForContactOwnerAssignment)

                                    @contactOwnerManager.updateLastAssigned(sourceForContactOwnerAssignment)
                            ).catch((error) =>
                                console.log('ELSE error', error)
                            )  
                )
            # wagner.get('EmailTransport').sendRequestConfirmDealEmail(options)
        ).catch((error) =>
            console.log('ELSE error', error)
        )

    createLeadAndSendEmailForCarsDirect:(options) =>
        console.log('comeing')
        sourceForContactOwnerAssignment = options.source_utm.trim()
        @getContactOwnerEmailByContactEmail(options.email_address).then((user) =>
            if user && user.contact_owner_email
                update= 
                    contact_owner_email: user.contact_owner_email
                @updateProfile(options.user_id, update).then (userInfo) =>
                    @generateUserAndDealLogs(options, sourceForContactOwnerAssignment)
            else
                console.log('userContactowner',user.contact_owner_email)
                # get last contact owner
                @getLastUser().then (lastUserDetails) =>
                    console.log("Emaill ", lastUserDetails.contact_owner_email)
                    @contactOwnerManager.getAvilableContactOwnerEmail(lastUserDetails.contact_owner_email, sourceForContactOwnerAssignment).then((user) =>
                        update= 
                            contact_owner_email: user
                        console.log('ContactOwnerEmail',user);
                        @updateProfile(options.user_id, update).then (user) => 
                            @generateUserAndDealLogs(options, sourceForContactOwnerAssignment)
                            @contactOwnerManager.updateLastAssigned(sourceForContactOwnerAssignment)
                    ).catch((error) =>
                        console.log('ELSE error', error)
                    )
            console.log options
            wagner.get('EmailTransport').sendRequestConfirmDealEmail(options)

        ).catch((error) =>
            console.log('ELSE error', error)
        )


    getContactOwnerEmailByContactEmail:(contact_email) =>
       return new Promise (resolve, reject) =>
            query =
                where:
                    email_address: contact_email
            @user.findOne(query).then (user)=>
                if user
                    resolve user
                else
                    resolve false
            .catch (error)=>
                reject error

    
    generateUserAndDealLogs: (options, sourceForContactOwnerAssignment) =>
        @wagner.get('UserManager').findById(options.user_id).then (userdetails)=>
            console.log('userdetails',userdetails)
            if userdetails.contact_owner_email != null
                logString = "#{userdetails.first_name} #{userdetails.last_name} created a request from #{sourceForContactOwnerAssignment} for a vehicle #{options.brand}, #{options.model}, #{options.year}, #{options.trim} was assigned to <b>#{userdetails.contact_owner_email}</b> deal owner on"
                contactOwnerString = "#{userdetails.first_name} #{userdetails.last_name} was assigned to <b>#{userdetails.contact_owner_email}</b> deal owner from round robin on"           
            else
                logString = "#{userdetails.first_name} #{userdetails.last_name} created a request from #{sourceForContactOwnerAssignment} for a vehicle #{options.brand}, #{options.model}, #{options.year}, #{options.trim} was not assigned to any deal owner on"
                contactOwnerString = "#{userdetails.first_name} #{userdetails.last_name} was not assigned to any deal owner from round robin on"           

            wagner.get('CPortaluserManager').userLogs({id:userdetails.id, logString:logString}, 'request', sourceForContactOwnerAssignment, {year:options.year, make:options.brand, model:options.model, trim:options.trim }).then( 
                (logres)=> console.log "final log res", logres 
                (error)=> console.log error)

            wagner.get('CPortaluserManager').userLogs({id:userdetails.id, logString:contactOwnerString}, 'register', sourceForContactOwnerAssignment, {year:options.year, make:options.brand, model:options.model, trim:options.trim }).then( 
                (logres)=> console.log "final log res", logres 
                (error)=> console.log error)

            wagner.get('CPortaluserManager').vehicleRequestLogs({id:options.id, logString:logString}, 'created', sourceForContactOwnerAssignment, {year:options.year, make:options.brand, model:options.model, trim:options.trim }).then( 
                (logres)=> console.log "===========> final log res", logres 
                (error)=> console.log error)


    getLastUser: () =>
        return new Promise (resolve, reject) =>
            query =
                order: [['id', 'DESC']]
                limit: 2
            @user.findAll(query)
                .then (user) =>
                    if !user
                        resolve false
                    else
                        resolve user[1]
                .catch (error) =>
                    reject error

module.exports = UserManager

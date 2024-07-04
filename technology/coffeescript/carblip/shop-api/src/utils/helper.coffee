config = require('../config')
AWS = require('aws-sdk')
moment = require('moment-timezone')
Promise = require('bluebird')
async = require 'async'
request = require('request')
Jimp = require('jimp')
phoneFormatter = require('phone-formatter')
emailValidator = require('email-validator')
_ = require 'underscore'
constants = require('../core/constants');
fs = require('fs')
openpgp = require("openpgp")
uuidv1 = require('uuid/v1')
Op = require('sequelize').Op

AWS.config.update config.aws

sqs = new AWS.SQS()
s3 = new (AWS.S3)(params: Bucket: config.AWS_S3_BUCKET)

Array::unique = ->
  output = {}
  output[@[key]] = @[key] for key in [0...@length]
  value for key, value of output
  
  
apiCall=(options,callback) ->
    request options, (error, response, body) =>
        if !error and [ 200, 204, 201 ].indexOf( response.statusCode ) != -1
            try
                data = JSON.parse(body)
            catch error
                data = body
            callback(null,data)
        else
            callback(error,null)

downloadImage=(url) ->
    return new Promise (resolve, reject) =>
        options=
            url: url
            encoding: null

        apiCall options,(error,result)=>
            if error?
                reject error
            else
                resolve result

cropImage=(url,callback)->
    Jimp.read url, (err, image) ->
        height = (640 * image.bitmap.height) / image.bitmap.width
        image
            .resize(640, height, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
            .contain(640, 480, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
            .getBase64 Jimp.MIME_PNG, (err, src) ->
                if err?
                    callback err,null
                else
                    result=new Buffer(src.replace(/^data:image\/\w+;base64,/, ''), 'base64')
                    callback null,result

cropImageWaterMark=(url,callback)->
    Jimp.read url, (err, image) ->
        image.crop(0, 0, image.bitmap.width, image.bitmap.height-20).getBase64 Jimp.MIME_PNG, (err, src) ->
            if err?
                callback err,null
            else
                result=new Buffer(src.replace(/^data:image\/\w+;base64,/, ''), 'base64')
                callback null,result


uploadS3= (data,pathUrl) ->
    return new Promise (resolve, reject) =>
        path = config.AWS_S3_BUCKET + '/' + config.s3_folder + '/' + pathUrl
        s3.putObject {Body: data,Key: path}, (error, data) ->
            if error
                reject error
            else
                urlParams =
                    Bucket: config.AWS_S3_BUCKET
                    Key: path
                s3.getSignedUrl 'getObject', urlParams, (err, url) ->
                    awsUrl = url.split('?')[0]
                    resolve awsUrl

uploadDocToS3= (file,folderName,callback) ->
    return new Promise (resolve, reject) =>
        fileInfo = Buffer.from(file, 'binary')
        params=
            Body: fileInfo, 
            Bucket: config.AWS_S3_CREDIT_APP_BUCKET, 
            Key: config.AWS_S3_CREDIT_APP_BUCKET + '/' + folderName

        s3.putObject params, (error, data) ->
            if error
                reject error
            else
                resolve data 

getSignedUrl=(path, callback) -> 
    return new Promise (resolve, reject) => 
        urlParams =
                Bucket: config.AWS_S3_CREDIT_APP_BUCKET
                Key: config.AWS_S3_CREDIT_APP_BUCKET + '/' + path
                Expires: 9

        s3.getSignedUrl 'getObject', urlParams, (err, url) ->
            awsUrl = url.split('?')[0]
            callback null,url

uploadS3Image=(data,pathUrl,callback) ->
    path = config.AWS_S3_BUCKET + '/' + config.s3_folder + '/' + pathUrl
    s3.putObject {Body: data,Key: path,ContentEncoding: 'base64',ContentType: 'image/png'}, (error, data) ->
        if error
            callback error,null
        else
            urlParams =
                Bucket: config.AWS_S3_BUCKET
                Key: path
            s3.getSignedUrl 'getObject', urlParams, (err, url) ->
                awsUrl = url.split('?')[0]
                callback null,awsUrl


pushToSQS = (payload,sqsUrl,callback) ->
    sqsParams=
        MessageBody: JSON.stringify(payload)
        QueueUrl: sqsUrl

    sqs.sendMessage sqsParams, (err, data) ->
        if err?
            callback err, null
        else
            callback null, true

processImage = (image_url, vehicleColorMediaId) ->
    return new Promise (resolve, reject) =>
        async.waterfall [
            # crop image
            (callback)=>
                cropImage image_url,(error,image_data)=>
                    callback error,image_data
            # upload s3
            (image_data,callback)=>
                url = 'manual/' + vehicleColorMediaId + '/' + Date.now() + '.png'
                uploadS3Image image_data,url,(error,result)=>
                    callback error, result
        ],(error,result)=>
            if error?
                reject error
            else
                resolve result

numberWithCommas = (x) ->
    if (typeof x != 'undefined' && x != null)
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else 
        return '';

formatPrice = (x) ->
    fNumber = numberWithCommas(x)
    if fNumber
        return '$' + fNumber
    else
        return fNumber 

numberWithK = (x) -> 
    result = x
    if x >= 1000
        result = parseFloat((x / 1000).toFixed(2)) + 'K'
    return result

formatMiles = (x) ->
    result = x
    if x >= 1000
        result = parseFloat((x / 1000).toFixed(2)) + 'k'
    return result

formatPhoneNumber = (x) ->
    phone_number = null
    if x
        phone_number = x.replace(/[^0-9]/g, "")
        phone_number = phoneFormatter.format(phone_number, '+1NNNNNNNNNN')
    # phone_number = null if phone_number.includes('N')
    return phone_number

formatPhoneNumberNational = (x) ->
    phone_number = null
    if x
        phone_number = x.replace(/[^0-9]/g, "")
        phone_number = phoneFormatter.format(phone_number, 'NNNNNNNNNN')
    # phone_number = null if phone_number.includes('N')
    return phone_number

formatInternalMedias = (medias) ->
    medias_group =  _.groupBy medias, (item) =>
        return item.primary_color_option_code + ':' + item.shot_code
    return _.map medias_group, (group_item) =>
        initial_obj = 
            oem_code: ''
            url_2100: ''
            url_1280: ''
            url_640: ''
            url_320: ''
            shot_code: ''
            type: ''
        _.each group_item, (item) =>
            initial_obj.oem_code = item.primary_color_option_code if !initial_obj.primary_color_option_code
            initial_obj.shot_code = '0' + item.shot_code if !initial_obj.shot_code
            initial_obj['url_'+item.width] = item.url
            if (!initial_obj.type)
                initial_obj.type = _.findKey constants.chrome_media_type, (type_item) =>
                    type_item == item.type
        return initial_obj
    return medias

getFinancePrice = (vehiclePrice, downPayment, financeTerm, salesTax, interestRate, tradeIn) ->
    tax = vehiclePrice * (salesTax / 100)
    totalPrice = vehiclePrice - (downPayment + tradeIn) + tax
    installments = financeTerm
    if interestRate == 0
        return Math.round(totalPrice / installments)
    y = 1 + interestRate / 100.0 / 12.0
    monthlyPayment = (totalPrice * Math.pow(y, installments) * (y - 1)) / (Math.pow(y, installments) - 1)
    return Math.round(monthlyPayment)

getLeasePrice = (vehiclePrice, downPayment, leaseTerm, salesTax, interestRate, tradeIn, mile) ->
    residual = getResidual(mile, leaseTerm)
    a = vehiclePrice - downPayment - tradeIn
    b = (vehiclePrice * residual) / 100
    c = (a - b) / leaseTerm
    d = ((a + b) * interestRate) / 2400
    monthlyPayable = c + d
    tax = (c + d) * (salesTax / 100)
    f = Math.round(monthlyPayable + tax)
    return if f < 0 then 0 else f

getResidual = (mile, leaseTerm) ->
    arrayFilter = _.find constants.LEASE_CALC_COMBINATION_JSON, (item) =>
      item.annual_mileage == mile && item.terms_in_months_price == leaseTerm
    if arrayFilter
        residual = arrayFilter['residual_value'] || 0;
        return residual;
    return 0;

formatMyRequest = (request) ->
    request.vehicle_type = constants.vehicle_type[request.vehicle_type] || null
    if request.VehicleRequestPreference
        requestPreference = JSON.parse(request.VehicleRequestPreference.preferences)
        exteriorColor = null;

        formatted_price = request.total_price
        buying_method = request.buying_method
        if !request.vehicle_type && buying_method != 1
            userCarInfo = requestPreference.user_car_information
            termInMonth = userCarInfo?.term_in_months
            downPayment = userCarInfo?.down_payment
            annualMilage = userCarInfo?.annual_milage
            if buying_method == 2
                formatted_price = getFinancePrice request.total_price, downPayment, termInMonth, constants.CALCULATION.salesTax, constants.CALCULATION.interestRate, constants.CALCULATION.tradeInValue
            else if buying_method == 3
                formatted_price = getLeasePrice request.total_price, downPayment, termInMonth, constants.CALCULATION.salesTax, constants.CALCULATION.interestRate, constants.CALCULATION.tradeInValue, annualMilage

        request.setDataValue('formatted_price', formatted_price)

        if requestPreference.exterior_colors_oem && requestPreference.exterior_colors_oem.length
            exteriorColor = requestPreference.exterior_colors_oem[0]
        else if requestPreference.exterior_colors && requestPreference.exterior_colors.length
            exteriorColor = requestPreference.exterior_colors[0]
            exteriorColor = exteriorColor.split('-')[0]

        if (exteriorColor)
            medias = request.Vehicle.VehicleMedia
            medias = _.filter medias, (item) ->
                return item.primary_color_option_code == exteriorColor
            medias_group =  _.groupBy medias, (item) =>
                return item.primary_color_option_code + ':' + item.shot_code + '-' + item.background_type
            medias = _.map medias_group, (group_item) =>
                initial_obj = 
                    oem_code: ''
                    url_2100: ''
                    url_1280: ''
                    url_640: ''
                    url_320: ''
                    shot_code: ''
                    type: ''
                _.each group_item, (item) =>
                    media_type = _.findKey constants.chrome_media_type, (tmp) ->
                        tmp == item.type
                    initial_obj.oem_code = item.primary_color_option_code if !initial_obj.oem_code
                    initial_obj.shot_code = '0' + item.shot_code if !initial_obj.shot_code
                    initial_obj.type = media_type if !initial_obj.type
                    initial_obj['url_'+item.width] = item.url
                return initial_obj
            request.setDataValue('VehicleMedias', medias)
    if request.Vehicle && request.Vehicle.VehicleMedia
        request.Vehicle.setDataValue('VehicleMedia', null)
    
    has_credit_application = false
    credit_application_id = null
    way_of_applying = null
    if request.CreditApplications && request.CreditApplications.length
        has_credit_application = true
        way_of_applying = 1
        credit_application_id = request.CreditApplications[0].id
        _.each request.CreditApplications, (item) => 
            if item.primary_app
                credit_application_id = item.primary_app.id
        if request.CreditApplications.length > 1
            way_of_applying = 2  

    
    request.setDataValue('has_credit_application', has_credit_application)
    request.setDataValue('credit_application_id', credit_application_id)
    request.setDataValue('way_of_applying', way_of_applying)
    return request

formatCreditApplicationFromRequest = (request) ->
    credit_app = if request && request.CreditApplications then request.CreditApplications[0] else null
    has_credit_application = false
    way_of_applying = null
    primary = null
    co = null

    if credit_app
        has_credit_application = true
        way_of_applying = if credit_app.joint_app then 2 else 1
        primary = credit_app
        co = credit_app.joint_app

    result = 
        has_credit_application: has_credit_application
        way_of_applying: way_of_applying
        primary: primary
        co: co

    return result

isPhoneNumberInvalid = (number) ->
    numberFormatted = formatPhoneNumber(number)
    !numberFormatted || _.contains numberFormatted, 'N'

isEmailInvalid = (email) ->
    first_split = email.split('@')[1]
    tld = _.last first_split.split('.')
    return !emailValidator.validate(email) ||  !_.includes(constants.HUBSPOT_VALID_TLD, tld.toLocaleUpperCase())
    
getValidUsPhoneNumber = (number) ->
    result = ''
    if (number && number.trim && number.indexOf('+1') == 0)
        number = phoneFormatter.format(number, 'NNN-NNN-NNNN')
        number = if _.contains(number, 'N') then '' else number
        result = number;
    return result

formatCreditApplication = (data) ->
    result = 
        id: data.id
        primary:
            first_name: data.first_name
            middle_name: data.middle_name
            last_name: data.last_name
            phone: data.phone
            email_address: data.email_address
            date_of_birth: data.date_of_birth
            residence_type: constants.residence_type[data.residence_type]
            monthly_rent: formatPrice(data.monthly_rent)
            street_address: data.street_address
            apt: data.apt
            city: data.city
            state: data.state
            zipcode: data.zipcode
            employer_name: data.employer_name
            employer_address: data.employer_address
            employer_phone: data.employer_phone
            gross_monthly_income: formatPrice(data.gross_monthly_income)
            social_security_number: data.social_security_number
            driver_licence_state: data.driver_licence_state
            driver_licence_number: data.driver_licence_number
        joint_app: null
    if data.joint_app
        joint_app = data.joint_app
        result.joint_app = 
            first_name: joint_app.first_name
            middle_name: joint_app.middle_name
            last_name: joint_app.last_name
            phone: joint_app.phone
            email_address: joint_app.email_address
            date_of_birth: joint_app.date_of_birth
            residence_type: constants.residence_type[joint_app.residence_type]
            monthly_rent: formatPrice(joint_app.monthly_rent)
            street_address: joint_app.street_address
            apt: joint_app.apt
            city: joint_app.city
            state: joint_app.state
            zipcode: joint_app.zipcode
            employer_name: joint_app.employer_name
            employer_address: joint_app.employer_address
            employer_phone: joint_app.employer_phone
            gross_monthly_income: formatPrice(joint_app.gross_monthly_income)
            social_security_number: joint_app.social_security_number
            driver_licence_state: joint_app.driver_licence_state
            driver_licence_number: joint_app.driver_licence_number

    return result

formatModelData = (model) =>
    if !model.image_url
        model.setDataValue('image_url', config.image_placeholder)
    if !model.image_url_320
        model.setDataValue('image_url_320', config.image_placeholder_320)
    if !model.image_url_640
        model.setDataValue('image_url_640', config.image_placeholder_640)
    if !model.image_url_1280
        model.setDataValue('image_url_1280', config.image_placeholder_1280)
    if !model.image_url_2100
        model.setDataValue('image_url_2100', config.image_placeholder_2100)
    if model.trim
        model.setDataValue('trim', formatTrimName(model.trim, model.brand_id))
    if model.friendly_style_name
        model.setDataValue('friendly_style_name', formatTrimName(model.friendly_style_name, model.brand_id))
    return model

formatTrimData = (trim) =>
    if !trim.image_url
        trim.setDataValue('image_url', config.image_placeholder)
    if !trim.image_url_320
        trim.setDataValue('image_url_320', config.image_placeholder_320)
    if !trim.image_url_640
        trim.setDataValue('image_url_640', config.image_placeholder_640)
    if !trim.image_url_1280
        trim.setDataValue('image_url_1280', config.image_placeholder_1280)
    if !trim.image_url_2100
        trim.setDataValue('image_url_2100', config.image_placeholder_2100)
    if trim.trim
        trim.setDataValue('trim', formatTrimName(trim.trim, trim.brand_id))
    if trim.friendly_style_name
        trim.setDataValue('friendly_style_name', formatTrimName(trim.friendly_style_name, trim.brand_id))
    return trim

parseCommaStringToFloat = (x) =>
    parseFloat(x.replace(/,/g, ''));

formatCreditApplicationProperties = (data) =>
    if (typeof data.gross_monthly_income == 'string')
        data.gross_monthly_income = parseCommaStringToFloat(data.gross_monthly_income)
    if (typeof data.monthly_rent == 'string')
        data.monthly_rent = parseCommaStringToFloat(data.monthly_rent)
    return data

formatTrimName = (name, brand_id) =>
    name = switch
        when brand_id == 39 then name.replace(' (Natl)', '')
        else name
    return name

formatDealStage = (items, pipelineName) =>
    _.map items, (item) =>
        data =
            stage_id: item.id
            label: item.label
            order: item.displayOrder
            pipeline_name: pipelineName
            active: true
            # created_at: item.createdAt
            # updated_at: item.updatedAt
        return data

generatePgpKey = (name,email,filename,folderName, callback) ->
    return new Promise (resolve, reject)=>
        uuid = uuidv1()
        value = 
            userIDs: 
                [
                    {
                        name: name, email: email,
                    }
                ]
            curve: "ed25519",
            passphrase: uuid
        keys = openpgp.generateKey(value)
        keys.then((res)=>
            res['passPhrase'] = uuid
            @pgpEncrypt(res.publicKey, filename).then (res1)=>
                @uploadDocToS3(res1, folderName).then (uploadRes)=>
                    callback null,res
            .catch (err)=>
                reject err
            resolve "Success"
        )
        .catch (error) =>
            reject error 

pgpEncrypt = (publicKeyArmored,filename) =>
    return new Promise (resolve, reject)=>
        plainData = filename.toString('base64')
        publicKey = openpgp.readKey({ armoredKey: publicKeyArmored })
        publicKey.then((publicKeyInfo)=>
            messageBody = openpgp.createMessage({ text: plainData })
            messageBody.then((res)=> 
                encrypted = openpgp.encrypt({ message: res, encryptionKeys: publicKeyInfo })
                encrypted.then((pgpMessage)=>
                    if !pgpMessage
                        reject 'Failed'
                    else 
                        resolve pgpMessage
                )
            )
        )
    
pgpDecrypt = (privateKeyArmored, passphrase, data, callback) =>
    return new Promise (resolve, reject)=>
        encryptedData = data.toString()
        privateKey = openpgp.readPrivateKey({ armoredKey: privateKeyArmored })
        privateKey.then((privateKeyInfo)=>
            decryptPrivateKey = openpgp.decryptKey({privateKey: privateKeyInfo, passphrase: passphrase})
            decryptPrivateKey.then((reskey)=>
                messageBody = openpgp.readMessage({ armoredMessage: encryptedData })
                messageBody.then((readMessage)=>
                    decrypted = openpgp.decrypt({ message: readMessage, decryptionKeys: reskey })
                    decrypted.then((pgpDecryptedMessage)=>
                        if pgpDecryptedMessage
                            callback null, pgpDecryptedMessage.data
                            resolve "Success"
                        else    
                            reject "Failure"
                    )
                )
            )
        )

getKeyAWSSecretManager = (param, callback) =>
    return new Promise (resolve, reject) =>
        region = "us-east-1"
        secretName = param.secretname
        secret = null
        decodedBinarySecret = null
        client = new AWS.SecretsManager({ region: region })
        client.getSecretValue {SecretId: secretName}, (error, data) ->
            if error
                reject error
            else
                callback null, JSON.parse(data.SecretString)
                resolve data.SecretString

setKeyAWSSecretManager = (param, callback) =>
    return new Promise (resolve, reject) =>
        region = "us-east-1"
        client = new AWS.SecretsManager({ region: region })
        params =
            ClientRequestToken: uuidv1(), 
            Description: param.description, 
            Name: param.secretname, 
            SecretString: JSON.stringify(param.secret)
        client.createSecret params, (error, data) ->
            if error
                reject error
            else
                callback null, data
                resolve data

generateSequelizeOp = (operator, value) ->
    operation = Op[operator]
    condition = {}; condition[operation] = value
    condition



module.exports.uploadS3 = uploadS3
module.exports.processImage = processImage
module.exports.uploadS3Image = uploadS3Image
module.exports.downloadImage = downloadImage
module.exports.uploadDocToS3 = uploadDocToS3
module.exports.getSignedUrl = getSignedUrl
module.exports.cropImage = cropImage
module.exports.cropImageWaterMark = cropImageWaterMark
module.exports.pushToSQS = pushToSQS
module.exports.numberWithCommas = numberWithCommas
module.exports.formatMiles = formatMiles
module.exports.numberWithK = numberWithK
module.exports.formatPhoneNumber = formatPhoneNumber
module.exports.formatInternalMedias = formatInternalMedias
module.exports.formatMyRequest = formatMyRequest
module.exports.isPhoneNumberInvalid = isPhoneNumberInvalid
module.exports.getValidUsPhoneNumber = getValidUsPhoneNumber
module.exports.formatCreditApplicationFromRequest = formatCreditApplicationFromRequest
module.exports.formatCreditApplication = formatCreditApplication
module.exports.formatPrice = formatPrice
module.exports.formatModelData = formatModelData
module.exports.formatTrimData = formatTrimData
module.exports.formatCreditApplicationProperties = formatCreditApplicationProperties
module.exports.isEmailInvalid = isEmailInvalid
module.exports.formatTrimName = formatTrimName
module.exports.formatDealStage = formatDealStage
module.exports.formatPhoneNumberNational = formatPhoneNumberNational
module.exports.generatePgpKey = generatePgpKey
module.exports.pgpEncrypt = pgpEncrypt
module.exports.pgpDecrypt = pgpDecrypt
module.exports.getKeyAWSSecretManager = getKeyAWSSecretManager
module.exports.setKeyAWSSecretManager = setKeyAWSSecretManager
module.exports.generateSequelizeOp = generateSequelizeOp


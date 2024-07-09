config = require('../config')
fs = require('fs')
openpgp = require("openpgp")
uuidv1 = require('uuid/v1')


AWS.config.update config.aws

sqs = new AWS.SQS()
s3 = new (AWS.S3)(params: Bucket: AWS_S3_BUCKET)

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


module.exports.uploadS3 = uploadS3
module.exports.processImage = processImage
module.exports.uploadS3Image = uploadS3Image
module.exports.downloadImage = downloadImage
module.exports.uploadDocToS3 = uploadDocToS3
module.exports.generatePgpKey = generatePgpKey
module.exports.pgpEncrypt = pgpEncrypt
module.exports.pgpDecrypt = pgpDecrypt


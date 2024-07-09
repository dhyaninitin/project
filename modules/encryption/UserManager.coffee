Promise = require('bluebird')
config = require('../config')
_ = require 'underscore'
helper = require('../utils/helper')
CryptoJS = require("crypto-js")
generateSequelizeOp = helper.generateSequelizeOp

class UserManager

    constructor: (@wagner) ->
        
        @user=@wagner.get('User')

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

module.exports = UserManager

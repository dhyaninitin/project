HTTPStatus = require('http-status')
google = require('googleapis').google
config = require('../config')
async = require 'async';
fs = require('fs');
path = require('path');
http = require('http');
url = require('url');
    
module.exports = (app, wagner, checkAuthenticated) ->

    yaml = require('yamljs')

    app.use checkAuthenticated.isPhoneWhitelisted, (req, res, next) ->
        return next()

    require('./apis')(app, wagner, checkAuthenticated)

    app.get "/", (req, res, next) ->
        res.render 'index', { title: 'Express',users:req.user,message: req.flash('message') }

    app.get '/health', (req,res) ->
        res.send "OK"

    yaml = require('yamljs')
    fs = require('fs')

    app.get '/swagger.yaml', (req,res,next) ->
        res.sendFile( __dirname + '/swagger.yaml')

    app.get '/swagger.json', (req,res,next) ->
        try
            fs.accessSync './src/swagger.yaml'
            path = './src/swagger.yaml'
        catch e
            path = __dirname+'/swagger.yaml'
        fs.readFile path, (err,data) =>
            text = yaml.parse(data.toString());
            json = JSON.stringify text
            res.send json

    app.get '/google-auth', (req,res,next) ->
        auth_redirect_url = config.google.auth_redirect_url
        keyPath = path.join(__dirname, '../secrets/oauth2.keys.json');
        scopes = ['https://www.googleapis.com/auth/drive']
        keys = {}
        if fs.existsSync(keyPath)
            keys = require(keyPath).web;
            
        qs = new url.URL(req.url, 'http://localhost:3000')
          .searchParams;
        oauth2Client = new google.auth.OAuth2(
          keys.client_id,
          keys.client_secret,
          auth_redirect_url
        );
        google.options({auth: oauth2Client});
        oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes.join(' '),
        });
        
        code = qs.get('code')

        oauth2Client.getToken(code).then (r)=>
            tokens = r.tokens
            if tokens.refresh_token?
                payload =
                    value: tokens['refresh_token'] 
                wagner.get('ApiCredentialManager').updateGoogleRefreshToken(payload).then (result) =>
                  res.send "Successfully created."
            else
                res.send "Refresh token is not available."
        .catch (err)=>
            console.log err.stack
            res.send "Something went wrong."

    app.get '/refresh_token', (req,res,next) ->
        auth_redirect_url = config.google.auth_redirect_url
        keyPath = path.join(__dirname, '../secrets/oauth2.keys.json');
        scopes = ['https://www.googleapis.com/auth/drive']
        keys = {}
        if fs.existsSync(keyPath)
            keys = require(keyPath).web;

        authURL = 'https://accounts.google.com/o/oauth2/auth?scope='+scopes.join(',')+'&response_type=code&access_type=offline&redirect_uri='+auth_redirect_url+'&client_id='+ keys.client_id
        res.redirect(authURL);

            
    app.use (req, res, next) ->
      if req.user
        return next()
      res.status(HTTPStatus.NOT_IMPLEMENTED).json 
        'success': '0',
        message: 'Method Not Implemented'

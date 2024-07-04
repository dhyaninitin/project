FacebookStrategy = require('passport-facebook').Strategy
LocalStrategy = require('passport-local').Strategy
BasicStrategy = require('passport-http').BasicStrategy
async = require 'async'
config = require('../config')

module.exports = (wagner) ->

    passport = wagner.get('passport')

    passport.serializeUser (user, done) ->
        done null, user.id


    passport.deserializeUser (id, done) ->
        wagner.get('UserManager').findById(id).then (user)=>
            done null,user
        .catch (error)=>
            done error,null

    passport.use 'facebook', new FacebookStrategy({
        clientID: config.facebook.appId
        clientSecret: config.facebook.appSecret
        callbackURL: config.facebook.callbackURL
        profileFields: ['id','email','gender','birthday','location','name','about','education','work']
        enableProof: true
        passReqToCallback: true
        }, (req, accessToken, refreshToken, profile, done) ->
            if profile._json.location?.name?
               location = profile._json.location.name
            else
               location = null
            options=
                first_name:profile._json.first_name
                last_name:profile._json.last_name
                facebook_id:profile._json.id
                email_address:profile._json.email
                gender:profile._json.gender
                access_token:accessToken
                date_of_birth:profile._json.birthday
                location:location
                status:1
            wagner.get('UserManager').upsertUser(options).then (user)=>
                wagner.get('UserManager').bulkUpsertWorkHistory(profile._json.work,user.id)
                wagner.get('UserManager').bulkUpsertEducation(profile._json.education,user.id)
                done(null,user)
            .catch (error)=>
                done(error,null)
    )

    passport.use 'register', new LocalStrategy({
        usernameField: 'email'
        passwordField: 'password'
        passReqToCallback: true
    }, (req, username, password, done) ->
        if req.body.password != req.body.cpassword
            done null, false, req.flash('message', 'Password Does Not Match')
        else
            options =
                first_name: req.body.first_name
                last_name: req.body.last_name
                facebook_id: ''
                email_address: req.body.email
                zipcode: req.body.zipcode
                password: password
                status:1
            host=req.headers.host    
            wagner.get('UserManager').emailUser(options,host).then((user) ->
                done null, user, req.flash('message', '') 
            ).catch (error) ->
                done null, false, req.flash 'message', error  
    )

    passport.use 'login', new LocalStrategy({
        usernameField: 'email'
        passwordField: 'password'
        passReqToCallback: true
    }, (req, email, password, done) ->
        options =
            email_address: email
            password: password
        wagner.get('UserManager').loginUser(options).then((user) ->
            if user
                done(null, user)
            else
                done(null,false)
        ).catch (error) ->
            done null, false, req.flash 'message', error
    )

    passport.use 'apiLogin', new BasicStrategy((email, password, done) ->
        options =
            email_address: email
            password: password
        wagner.get('UserManager').loginUser(options).then((user) ->
            if user
                wagner.get('UserManager').createSession(user).then (result)=>
                    console.log 'Session created'
                    done null, result.user_session
            else
                done null, false
        ).catch (error) ->
            done null, error
    )

    passport.use 'apiRegister', new BasicStrategy({
        passReqToCallback: true
    }, (req, email, password, done) ->
        options =
            first_name: req.body.first_name
            last_name: req.body.last_name
            phone: req.body.phone
            email_address: email
            password: password
            status: 1
            zipcode: req.body.zipcode
        wagner.get('UserManager').emailUser(options).then((user) ->
            if user
                done null, user
            else
                done null, false
        ).catch (error) ->
            done null, error
    )

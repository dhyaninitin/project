config = require('./config')
express = require('express')
wagner = require('wagner-core')
path = require('path')
AWS = require('aws-sdk')
favicon = require('serve-favicon')
cookieParser = require('cookie-parser')
cookieSession = require('cookie-session')
bodyParser = require('body-parser')
session = require('express-session')
Sequelize = require('sequelize')
passport = require('passport')
requestIp = require('request-ip')
http_status=require('http-status')
cors = require('cors')
flash = require('connect-flash')
standardHeaders = require "./utils/StandardHeaders"
forceSSL = require "./utils/forceSSL"
assets = require('express-asset-versions')
Raven = require('raven')
Analytics = require('analytics')
segmentPlugin = require('@analytics/segment')
require('express-namespace')
# require('body-parser-xml')(bodyParser)

wagner.factory 'config', config

PORT = process.env.PORT || 3000

app = express()

Raven.config(process.env.NODE_ENV != 'localhost' && config.SENTRY.dsn, {
  name: config.SENTRY.serverName
  environment: config.SENTRY.environment
  sendTimeout: config.SENTRY.sendTimeout
}).install();

wagner.factory 'Raven', () ->
    return Raven

analytics = Analytics.Analytics({
  app: config.SEGMENT.app_name,
  plugins: [
    segmentPlugin({
      writeKey: config.SEGMENT.api_key
    })
  ]
})

wagner.factory 'analytics', () ->
    return analytics
 

# The request handler must be the first middleware on the app
app.use Raven.requestHandler()

app.set('trust proxy', 1) # because we run in AWS behind a load balancer

AWS.config.update
    region: "us-phoenix-1"
    accessKeyId: config.AWS_ACCESS_KEY_ID
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY

checkAuthenticated = require('./middleware/checkAuthenticated')
sequelize = require('./utils/db')(wagner)
wagner.factory 'sequelize', () ->
    return sequelize


sequelizePortal = require('./utils/db-portal')(wagner)
wagner.factory 'sequelizePortal', () ->
    return sequelizePortal


wagner.factory 'passport', () ->
    return passport

# adding models
require('./models')(sequelize,wagner)
require('./models-portal')(sequelizePortal,wagner)

# adding dependencies
require('./utils/dependencies')(wagner,sequelize)

# adding manager
require('./manager')(wagner)

# enabling passport
require('./passport')(wagner)

# view engine setup
app.set 'views', path.join(__dirname, 'templates')
app.set 'view engine', 'ejs'

# uncomment after placing your favicon in public
#app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));



app.use bodyParser.json(limit: '50mb')
app.use bodyParser.urlencoded(extended: false,limit: '50mb')
app.use bodyParser.text()
app.use (req, res, next) ->
  res.set 'Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  next()
  return

# app.use forceSSL(wagner)
app.use cookieParser()
app.use cookieSession(
    name: "carblip"
    keys: ['key1','key2'])

assetPath = path.join(__dirname, 'public')
app.use('/public', express.static(assetPath));
app.use(assets('/public', assetPath));
app.use '/docs', express.static( __dirname + '/swagger' )
app.use passport.initialize()
app.use passport.session()
app.use flash()
app.use requestIp.mw()
app.use cors()
app.use standardHeaders(wagner)

# added routes
require('./routes')(app,wagner,checkAuthenticated)

###
# Request and Error Handling
###
app.use Raven.errorHandler()

# Optional fallthrough error handler
app.use (err, req, res, next) =>
  if(process.env.NODE_ENV == 'localhost')
    console.log(err.stack)
  res.sendStatus http_status.INTERNAL_SERVER_ERROR

app.set 'port', process.env.PORT || PORT
app.listen app.get('port')
console.log 'Running on http://localhost : ' + PORT



config = require('../config')
module.exports = (wagner) ->
    return (req, res, next) =>

        if !req.secure and config.sslEnabled and req.get('X-Forwarded-Proto') != 'https'
          res.redirect 'https://' + req.get('Host') + req.url
        else
          next()

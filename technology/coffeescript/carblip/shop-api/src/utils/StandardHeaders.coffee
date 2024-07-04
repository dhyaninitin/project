module.exports = (wagner) ->
    return (req, res, next) =>

        if req.get("x-forwarded-for")?
            ipAddress = req.get("x-forwarded-for").split(',')[0]
        else
            ipAddress = req.ip

        req.context =
            ip: ipAddress
        next()

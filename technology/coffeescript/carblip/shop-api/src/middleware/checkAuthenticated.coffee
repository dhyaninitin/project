moment = require('moment')
HTTPStatus = require('http-status')
helpers = require('../utils/helper');
constants = require('../core/constants');
config = require('../config');
request = require('request');

exports.isLoggedIn = (req, res, next) ->
	if !req.header('token')
		return res.status(HTTPStatus.UNAUTHORIZED).json(
			success: "0",
			message: constants.error_messages.Unauthorized
		)
	token = req.header('token')
	wagner.get('UserManager').getToken(token).then((user_session) ->
		if user_session
			if user_session.expiry <= moment().unix()
				return res.status(HTTPStatus.UNAUTHORIZED).json(
					success: "0",
					message: constants.error_messages.Unauthorized
				)
			else
				wagner.get('UserManager').getUserById(user_session.user_id).then (user) ->
					if !user.is_active
						res.status(HTTPStatus.FORBIDDEN).json 
							'success': '0',
							message: constants.error_messages.ForbiddenUser
					else
						wagner.get('UserManager').refreshToken(token)
						next()
		else
			return res.status(HTTPStatus.UNAUTHORIZED).json(
				success: "0",
				message: constants.error_messages.Unauthorized
			)
	).catch (error) ->
		res.status(HTTPStatus.UNAUTHORIZED).json 
			success: "0",
			message: constants.error_messages.Unauthorized

exports.isPhoneWhitelisted= (req, res, next) ->
	if req.body.phone
		phone = helpers.formatPhoneNumber(req.body.phone)

		wagner.get('PhoneLimitManager').findByPhone(phone).then((obj) ->
			if obj
				res.status(HTTPStatus.FORBIDDEN).json 
					'success': '0',
					message: constants.error_messages.PhoneBlocked
			else
				next()
		).catch (error) ->
			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
				success: "0",
				message: constants.error_messages.Default
				error: error.stack
	else
		next()

exports.isIpWhitelisted = (req, res, next) ->
	if req.clientIp
		wagner.get('ApiLimitManager').findByIp(req.clientIp).then((obj) ->
			if obj && obj.count > 3
				res.status(HTTPStatus.FORBIDDEN).json 
					'success': '0',
					message: constants.error_messages.IpBlocked
			else
				next()
		).catch (error) ->
			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
				success: "0",
				message: constants.error_messages.Default
				error: error.stack
	else
		next()


exports.isUserActive = (req, res, next) ->
	if req.body.phone or req.body.phone_number
		phone_number = if req.body.phone then req.body.phone else req.body.phone_number
		phone = helpers.formatPhoneNumber(phone_number)
		options = 
			phone: phone
		wagner.get('UserManager').phoneExists(options).then((user) ->
			if user && !user.is_active
				res.status(HTTPStatus.FORBIDDEN).json 
					'success': '0',
					message: constants.error_messages.InactiveUser
			else
				next()
		).catch (error) ->
			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
				success: "0",
				message: constants.error_messages.Default
				error: error.stack
	else
		next()

exports.isPortalRequest = (req, res, next) ->
	if !req.headers.authorization or req.headers.authorization.indexOf('Basic ') == -1
		return res.status(HTTPStatus.UNAUTHORIZED).json(
			success: "0",
			message: constants.error_messages.Unauthorized
		)

	base64Credentials = req.headers.authorization.split(' ')[1]
	credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
	[username, password] = credentials.split(':')
	if username != config.apiToken
		return res.status(HTTPStatus.UNAUTHORIZED).json(
			success: "0",
			message: constants.error_messages.Unauthorized
		)
	next()

exports.isWebhook = (req, res, next) ->
	token = req.query.token || req.body.token
	if !token or token != config.WEBHOOK_TOKEN
		return res.status(HTTPStatus.UNAUTHORIZED).json(
			success: "0",
			message: constants.error_messages.TokenInvalid
		)
	else
		next()

###exports.rateLimitCheck = (req, res, next) ->
	ip = req.ip;
	##Get hit count for that api
	wagner.get('ApiLimitManager').findByIp(ip).then((rateObj) ->
		hitCount = rateObj.count;

		console.log("rate", hitCount);
		if(hitCount > 2 )
			message = switch
				when hitCount == 3 
				then ws= 30 * 1000;  ##30 sec

				when hitCount == 4 
				then ws= 5 * 60 * 1000; ##5 min

				when hitCount == 5 
				then ws= 60 * 60 * 1000; ##60 min

				when hitCount == 6 
				then ws = 24 * 60 * 60 * 1000;
				
				when hitCount > 9 
				then ws ="30 day" ;
			
			wagner.get('ApiLimitManager').verifyPhoneLimiter(ws).then((limit) ->
				 		ip = req.ip;
						wagner.get('ApiLimitManager').increaseCount(ip);
						res.status(412).json 
							'success': '0',
							message: "limit"
						)
		else
			next()
	).catch (error) ->
		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
				success: "0",
				message: constants.error_messages.Default
				error: error.stack###
				

###verifyPhoneLimiter = rateLimit({
		windowMs: 30 * 60 * 1000, # 30 min window
		max: 2, # start blocking after 2 requests
		message:
		"Too many requests from this Phone, Please try again after 30 mins."
		keyGenerator: (req) =>
		return helpers.formatPhoneNumber(req.body.phone)
		onLimitReached: (req, res, options) =>
		ip = req.ip;
		wagner.get('ApiLimitManager').increaseCount(ip)
	});###

### limit code start here ###
exports.rateLimitCheck = (req, res, next) ->

	phoneNumber = req.body.phone;
	currentDate = new Date();
	curtDateObj = new Date();

	currentDate = new Date(currentDate.setDate(currentDate.getDate()+1)).toISOString().slice(0,10);
	prevDate = new Date(curtDateObj.setDate(curtDateObj.getDate()-1)).toISOString().slice(0,10);
	
	object = {
		"nextDate": currentDate,
		"phoneNumber" : phoneNumber,
		"prevDate": prevDate
	}
	
	##Get hit count for that api
	wagner.get('PhoneLimitManager').findByPhoneByTodayDate(object).then((rateObj) ->

		if(rateObj &&  rateObj.count >= 0 )
			hitCount = rateObj.count;
			## get updated date
			currentTime = new Date();
			
			datetime = new Date();
			currentDate = new Date(datetime.setDate(datetime.getDate()+1)).toISOString().slice(0,10);
			
			prevDay = new Date();

			object = {
				"currentDate": currentDate,
				"phoneNumber" : phoneNumber,
				"prevDay":  new Date(prevDay.setDate(prevDay.getDate()-1)).toISOString().slice(0,10)
			}

			wagner.get('PhoneLimitManager').checkPhoneNumberLimitExcceed(object).then((obj) ->
				current = moment.tz("UTC")._d;
				apitime = 0;
			
				createdATime = new Date(obj.updated_at+' UTC');

				difference=Math.round((current-createdATime)/1000);
				reqCount = 0;

				if(obj)
					reqCount = obj.count;
					
					ShowRequestCount = (reqCount - 1 );
					blockTillTime = Math.pow(3, ShowRequestCount ) * 10;
					newBlockTillTime = Math.pow(3, reqCount) * 10;
				else
					blockTillTime = null;
					newBlockTillTime = 30;

				## current time -  today last created at time diff
				timeDiff = difference;
				displayHorsSecLeft = convertSecondsToHm(blockTillTime);
				apitime = blockTillTime;

				if(reqCount == 1)
					next()

				else if(blockTillTime == null || timeDiff < blockTillTime )
					res.status(403).json 
						'success': '0',
						message: "Too many requests from this Phone, Please try again after "+ displayHorsSecLeft + " seconds",
						'time': apitime
							
				else
					next()
			)
		else
			datetime = new Date();
			prevDay = new Date();

			currentDate = new Date(datetime.setDate(datetime.getDate()+1)).toISOString().slice(0,10);
			prevDate = new Date(prevDay.setDate(prevDay.getDate()-1)).toISOString().slice(0,10);

			object = {
				"currentDate": currentDate,
				"phoneNumber": phoneNumber,
				"prevDay": prevDate
			}

			wagner.get('PhoneLimitManager').createRecord(phoneNumber).then((obj) ->)
			next()
	).catch (error) ->
		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json 
				success: "0",
				message: constants.error_messages.Default
				error: error.stack

convertSecondsToHm = (secs) ->
	days = Math.floor(secs / (60 * 60 * 24));
	divisor_for_hours = secs  %  (60 * 60 * 24);
	hours = Math.floor(divisor_for_hours / (60 * 60));
	divisor_for_minutes = secs % (60 * 60);
	minutes = Math.floor(divisor_for_minutes / 60);
	divisor_for_seconds = divisor_for_minutes % 60;
	seconds = Math.ceil(divisor_for_seconds);
	
	ret = "";
	if (days > 0) 
       	ret += "" + days + " Days and ";

	if (hours > 0) 
       	ret += "" + hours + " hours and ";
	
	if(minutes > 0)	   
        ret += "" + minutes + " minutes and ";
	
    ret += "" + seconds;
    return ret;

### code end here ###

### recaptcha validation start  ###
exports.validateRecaptcha = (req, res, next) ->
 
		## check request platform, if request come from ios then ignore
	user_agent = req.header('User-Agent') || null

	if(req.body.type == undefined && user_agent != 'iOS')
		token = req.body['tokencaptcha'];
		recaptcha_url = "https://recaptchaenterprise.googleapis.com/v1beta1/projects/braided-verve-343507/assessments?";
		recaptcha_url += "key=" + config.recaptcha_api_key;

		headers =
				'Content-Type': 'application/json'

		options = {
			'method': 'POST',
			'url': recaptcha_url,
			'headers': headers,
			body: JSON.stringify({
				"event": {
					"token": token,
					"siteKey": config.recaptcha_site_key
				}
			})
		}

		if( token == null || token == undefined )
			res.status(HTTPStatus.UNPROCESSABLE_ENTITY).json 
				'success': '0',
				message: "ReCaptcha token is not defined";
		else 
			request options, (error, response, body) =>
					resData = JSON.parse(body);
					if(!resData.error && resData.tokenProperties.valid)
						next();
					else	
						if(resData.tokenProperties.invalidReason == "DUPE")
							message = "Multiple Hits"
						else	
							message = resData.tokenProperties.invalidReason
						res.status(HTTPStatus.UNPROCESSABLE_ENTITY).json 
							'success': '0',
							message: "ReCaptcha validation failed : " + message
	else	
		next();
		
### recaptcha validation end  ###

	
		


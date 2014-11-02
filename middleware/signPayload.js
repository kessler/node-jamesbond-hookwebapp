var crypto = require('crypto')

/**
 * A middleware that calculates the sha1 hmac signature of the payload, 
 * assigning the result to 'localSignature' field in the request object
 */
module.exports = function (log) {
	return function signPayload(request, response, next) {
		log.debug('signPayload middleware')

		if (!request.payload) {
			return next(new Error('missing payload'))
		}

		if (!request.app) {
			return next(new Error('missing app'))
		}

		var hmac = crypto.createHmac('sha1', request.app.secret)
		
		var buff = new Buffer(request.payload)

		hmac.update(buff)
		request.localSignature = 'sha1=' + hmac.digest('hex')
		log.info('remote signature is 	[%s]', request.remoteSignature)
		log.info('local signature is 	[%s]', request.localSignature)
		
		next()
	}
}

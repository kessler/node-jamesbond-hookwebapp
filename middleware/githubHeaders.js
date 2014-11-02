
/**
 * A middleware that extract important github header values assigning them to fields in the request object
 */
module.exports = function (log) {
	return function middlwareGithubHeaders (request, response, next) {
		log.debug('githubHeaders middlware')
		
		var signature = request.headers['x-hub-signature']

		// bail if no signature
		if (!signature) {			
			return next(new Error('missing signature'))
		} else {
			request.remoteSignature = signature
		}

		var event = request.headers['x-github-event']

		// bail if no event
		if (!event) {			
			return next(new Error('missing event'))
		} else {		
			request.event = event
		}

		next()
	}	
} 
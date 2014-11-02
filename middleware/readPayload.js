
/**
 * A middleware that reads the body of the request and assign it to the 'payload' field in the request object
 */
module.exports = function(log) {
	return function readPayload(request, response, next) {		
		// it would be better (performance wise) to sign and read the payload at the same time 
		// but in order to do that I need the secret, and for that I need the secret key
		// if I dont want to have the application name included in the url then I have no 
		// choice but to read the payload (which includes the app name) separately
		// from signing the application
		log.debug('readPayload middleware')

		var payload = ''
		var length = 0

		request.on('end', function () {
			request.payload = payload
			log.info('finished reading payload of length [%d]', length)
			next()
		})

		request.once('readable', read)

		function read() {
			var line = ''

			while (line = request.read()) {
				length += line.length
				payload += line.toString('utf8')
			}

			request.once('readable', read)
		}
	}
}

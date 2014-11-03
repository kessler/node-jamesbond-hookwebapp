module.exports = function (log, broadcaster) {

	return function broadcast (request, response, next) {
		log.debug('broadcast middleware')
		
		if (!request.app) {
			return next(new Error('missing app'))
		}

		var event = request.headers['x-github-event']

		// bail if no event
		if (!event) {
			return next()
		}

		// bail if its not a push event
		if (request.app.events.indexOf(event) === -1) {
			log.warn('ignoring [%s] event', event)
			return next();
		}

		broadcaster(event, request.app)
		next()
	}
}
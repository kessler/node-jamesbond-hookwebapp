
/**
 * A middleware that parses the payload and assigning various properties to fields
 * in the request object, like: repository name, branch
 */
module.exports = function (log) {
	return function parsePayload (request, response, next) {
		log.debug('parsePayload middlware')

		if (!request.payload) {
			return next(new Error('missing payload'))
		}

		try {
			var parsedPayload = JSON.parse(request.payload)
		} catch (e) {
			return next(e)
		}

		request.repositoryName = parsedPayload.repository.name

		if (!request.repositoryName) {
			return next(new Error('missing repository name'))
		} else {
			log.info('repository name is %s', request.repositoryName)	
		}

		request.branch = parsedPayload.ref.split('/')

		if (request.branch.length === 0) {
			return next(new Error('missing branch name'))
		}

		request.branch = request.branch[request.branch.length - 1]

		if (!request.branch) {
			return next(new Error('missing branch name'))	
		}

		log.info('branch is %s', request.branch)
		
		next()
	}
}

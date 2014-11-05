
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

		var repositoryName = parsedPayload.repository.full_name

		if (!repositoryName) {
			return next(new Error('missing repository name'))
		}

		var branch = parsedPayload.ref.split('/')

		if (branch.length === 0) {
			return next(new Error('missing branch name'))
		}

		branch = branch[branch.length - 1]

		if (!branch) {
			return next(new Error('missing branch name'))	
		}

		request.appKey = repositoryName + '#' + branch

		log.info('key is [%s]', request.appKey)
		
		next()
	}
}

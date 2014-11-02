module.exports = function (log, db) {
	return function loadApp (request, response, next) {
		log.debug('loadApp middleware')
		
		if (!request.repositoryName) {
			return next(new Error('missing repository name'))
		}

		db.getApp(request.repositoryName, function (err, app) {
			if (err) return next(err)

			request.app = app
			next()
		})
	}
}

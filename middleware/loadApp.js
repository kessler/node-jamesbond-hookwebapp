module.exports = function (log, db) {
	return function loadApp (request, response, next) {
		log.debug('loadApp middleware')
		
		if (!request.repositoryName) {
		 	return next(new Error('missing repository name'))
		}

		if (!request.branch) {
		 	return next(new Error('missing branch'))
		}

		// if we fail to get app by repo name, try with branch too in the key
		db.getApp(request.repositoryName, function (err, app) {
			if (err) {
				return db.getApp(request.repositoryName + '#' + request.branch, appCallback)
			}

			appCallback(null, app)
		})

		function appCallback(err, app) {
			if (err) return next(err)
			
			if (app.branch === request.branch) {				
				request.app = app
			}

			next()
		}
	}
}

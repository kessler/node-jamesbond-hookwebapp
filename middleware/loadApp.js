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

		// if we succeed in loading the app, but the branches dont match we'll check if there is another app with user/repo#branch key
		function appCallback(err, app) {
			if (err) return next(err)

			if (app.branch === request.branch) {				
				request.app = app
				next()
			} else {
				db.getApp(request.repositoryName + '#' + request.branch, appCallback)	
			}
		}
	}
}

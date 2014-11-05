module.exports = function (log, db) {
	return function loadApp (request, response, next) {
		log.debug('loadApp middleware')
		
		if (!request.appKey) {
			return next(new Error('missing app key'))
		}

		db.getApp(request.appKey, function (err, app) {
			if (err) return next(err)

			request.app = app
			next()
		})
	}
}

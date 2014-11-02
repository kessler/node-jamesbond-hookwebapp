module.exports = function (log) {
	return function verifySignature (request, response, next) {
		log.debug('verifySignature middleware')

		if (!request.localSignature) return next(new Error('missing localSignature'))

		if (!request.remoteSignature) return next(new Error('missing remoteSignature'))

		if (request.localSignature !== request.remoteSignature) {
			return next(new Error('signatures do not match'))
		}

		next()
	}
}
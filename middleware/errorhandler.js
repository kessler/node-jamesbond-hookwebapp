module.exports = function (log) {
	return function errorHandler (err, request, response, next) {
		response.statusCode = 500
		response.end(err.message)			
		log.error(err)
	}	
} 
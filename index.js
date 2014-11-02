var loadApp = require('./middleware/loadApp')
var readPayload = require('./middleware/readPayload')
var parsePayload = require('./middleware/parsePayload')
var signPayload = require('./middleware/signPayload')
var verifySignature = require('./middleware/verifySignature')
var githubHeaders = require('./middleware/githubHeaders')
var broadcast = require('./middleware/broadcast')
var errorHandler = require('./middleware/errorHandler')
var end = require('./middleware/end')

// export all the middlewares
module.exports.middleware = {
	loadApp: loadApp,
	readPayload: readPayload,
	parsePayload: parsePayload,
	signPayload: signPayload,
	verifySignature: verifySignature,
	githubHeaders: githubHeaders,
	broadcast: broadcast,
	errorHandler: errorHandler,
	end: end
}

// an app "constructor"
module.exports.webapp = function (log, db, broadcaster, events) {
		
	var connect = require('connect')

	var webapp = connect()

	webapp.use('/hook', githubHeaders(log))
	webapp.use('/hook', readPayload(log))
	webapp.use('/hook', parsePayload(log))
	webapp.use('/hook', loadApp(log, db))
	webapp.use('/hook', signPayload(log))
	webapp.use('/hook', verifySignature(log))
	webapp.use('/hook', broadcast(log, broadcaster, events))

	webapp.use(end())
	webapp.use(errorHandler(log))

	return webapp
}
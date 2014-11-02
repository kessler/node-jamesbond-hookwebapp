var request = require('request')
var fs = require('fs')
var path = require('path')
var yalla = require('yalla')

module.exports.log = new yalla.Logger(yalla.LogLevel.ERROR)

var headers = module.exports.headers = JSON.parse(fs.readFileSync(path.join(__dirname, 'mockHeaders.json')))
var payload = module.exports.payload = fs.readFileSync(path.join(__dirname, 'mockPayload.json')).toString('utf8')

module.exports.send = function send(port, callback) {
	var req = request.post('http://localhost:' + port + '/hook', function(err, response, body) {
		if (err) return callback(error)

		callback(null, response, body)
	})

	req.headers = headers

	req.headers['content-length'] = payload.length

	req.end(payload)
}
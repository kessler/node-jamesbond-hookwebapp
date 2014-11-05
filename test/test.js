var should = require('should')
var fs = require('fs')
var path = require('path')

var util = require('./lib/util')

describe('hookwebapp', function () {

	describe('githubHeaders middleware', function () {
		var githubHeaders = require('../middleware/githubHeaders')(util.log)

		it('extracts info from github headers and assigns to request object', function (done) {
			var mockRequest = { headers: util.headers }

			githubHeaders(mockRequest, null, function () {
				mockRequest.should.have.property('remoteSignature', util.headers['x-hub-signature'])
				mockRequest.should.have.property('event', util.headers['x-github-event'])

				done()
			})
		})

		it('calls back with an error if a signature is missing', function (done) {
			var mockRequest = { headers: {} }

			githubHeaders(mockRequest, null, function (err) {
				err.should.be.an.Error
				err.message.should.eql('missing signature')
				done()
			})
		})

		it('calls back with an error if a signature is missing', function (done) {
			var mockRequest = { headers: { 'x-hub-signature': '123123123' } }

			githubHeaders(mockRequest, null, function (err) {
				err.should.be.an.Error
				err.message.should.eql('missing event')
				done()
			})
		})
	})

	describe('readPayload middleware', function () {
		var readPayload = require('../middleware/readPayload')(util.log)

		it('reads the body of the request', function (done) {
			var file = path.join(__dirname, 'lib', 'mockPayload.json')
			var req = fs.createReadStream(file)

			readPayload(req, null, function () {
				req.should.have.property('payload', util.payload)
				done()
			})
		})
	})

	describe('parsePayload middleware', function () {
		var parsePayload = require('../middleware/parsePayload')(util.log)
		
		it('extracts the repository name', function (done) {
			var mockRequest = { payload: util.payload }
			
			parsePayload(mockRequest, null, function(err) {
				mockRequest.should.have.property('appKey', 'kessler/testy#master')
				done(err)
			})	
		})

		it('calls back with an error if payload is missing', function (done) {
			var mockRequest = { }
			
			parsePayload(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing payload')
				done()
			})
		})

		it('calls back with an error if json is invalid', function (done) {
			var mockRequest = { payload: '{ "x": }}' }
			
			parsePayload(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('Unexpected token }')
				done()
			})
		})

		it('calls back with an error if the repository name is missing', function (done) {
			var mockRequest = { payload: '{ "repository": { "full_name": "" }}' }
			
			parsePayload(mockRequest, null, function(err) {				
				err.should.be.an.Error
				err.message.should.eql('missing repository name')
				done()
			})
		})

		it('calls back with an error if the branch is missing', function (done) {
			var mockRequest = { payload: '{ "ref": "", "repository": { "full_name": "123"} }' }
			
			parsePayload(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing branch name')
				done()
			})
		})
	})

	describe('loadApp middleware', function () {
		var mockApp = {}
		var mockDb = {
			getApp: function(name, callback) {
				if (name === 'kessler/testy#master') return callback(null, mockApp)
				callback(new Error('missing app'))
			}
		}

		var loadApp = require('../middleware/loadApp')(util.log, mockDb)

		it('loads an app from the database', function (done) {
			var mockRequest = { appKey: 'kessler/testy#master' }

			loadApp(mockRequest, null, function () {
				mockRequest.should.have.property('app', mockApp)
				done()
			})
		})

		it('calls back with an error if repository name is missing', function (done) {
			var mockRequest = { }
			
			loadApp(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing app key')
				done()
			})
		})

		it('calls back with an error if app is not in the database', function (done) {
			var mockRequest = { appKey: 'doesNotExist' }
			
			loadApp(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing app')
				done()
			})
		})
	})

	describe('signPayload middleware', function () {
		var signPayload = require('../middleware/signPayload')(util.log)

		it('calculates sha1 hmac of the payload and assigns it to localSignature field in the request object', function (done) {
			var mockRequest = { app: { secret: 'secret' }, payload: util.payload }

			signPayload(mockRequest, null, function () {
				mockRequest.should.have.property('localSignature', 'sha1=8c1c36fe11fe3a2a5cf1c1451ff0f6d7c80cf638')
				done()
			})
		})

		it('calls back with an error if payload is missing', function (done) {
			var mockRequest = { }
			
			signPayload(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing payload')
				done()
			})
		})

		it('calls back with an error if app is missing', function (done) {
			var mockRequest = { payload: '132' }
			
			signPayload(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing app')
				done()
			})
		})
	})

	describe('verifySignature middleware', function () {
		var verifySignature = require('../middleware/verifySignature')(util.log)

		it('calls back with an error if localSignature is missing', function (done) {
			var mockRequest = { }
			
			verifySignature(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing localSignature')
				done()
			})
		})

		it('calls back with an error if remoteSignature is missing', function (done) {
			var mockRequest = { localSignature: '123' }
			
			verifySignature(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('missing remoteSignature')
				done()
			})
		})

		it('calls back with an error if localSignature is missing', function (done) {
			var mockRequest = { localSignature: '123', remoteSignature: '1234' }
			
			verifySignature(mockRequest, null, function(err) {
				err.should.be.an.Error
				err.message.should.eql('signatures do not match')
				done()
			})
		})

		it('does nothing if signatures match', function (done) {
			var mockRequest = { localSignature: '123', remoteSignature: '123' }
			
			verifySignature(mockRequest, null, function(err) {
				should(err).eql(undefined)
				done()
			})	
		})
	})

	describe('broadcast middleware', function () {
		var mockApp = {
			events: ['push']
		}
		var event, app
		var mockBroadcaster = function(e, a) {
			event = e
			app = a
		}

		var broadcast = require('../middleware/broadcast')(util.log, mockBroadcaster)

		beforeEach(function () {
			event = undefined
			app = undefined
		})

		it('issues a broadcast', function (done) {
			var mockRequest = { headers: util.headers, app: mockApp}

			broadcast(mockRequest, null, function () {
				event.should.eql('push')
				app.should.eql(mockApp)
				done()
			})
		})

		it('does not issue a broadcast when event in the events array', function (done) {
			var mockRequest = { headers: { 'x-github-event': 'lalal' }, app: mockApp}

			broadcast(mockRequest, null, function () {
				should(app).eql(undefined)
				should(event).eql(undefined)
				done()
			})	
		})
	})

	describe('integration', function () {
		this.timeout(6000)
		var mockApp = {
			secret: 'secret',
			events: ['push']
		}

		var mockDb = {
			getApp: function(name, callback) {
				if (name === 'kessler/testy#master') return callback(null, mockApp)
				callback(new Error('missing app'))
			}
		}

		var event, app
		var broadcaster = function (e, a) {
			event = e
			app = a
		}

		var index = require('../index.js')

		var webapp = index.webapp(util.log, mockDb, broadcaster, ['push'])

		it('full cycle', function (done) {
			webapp.listen(8181, function () {

				util.send(8181, function (err, response, body) {
					if (err) return done(err)
					event.should.be.eql('push')
					app.should.be.eql(mockApp)
					response.statusCode.should.be.eql(200)
					done()
				})
			})
		})
	})
})
const { JPP } = require('../util/process.js')
var { array } = require('numjs')

process.on('message', function (data) {

	var x = array( data.x)
	var r = array( data.r)

	var result = JPP(x, r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)

	process.send({
		W: result.W.tolist(),
		H: result.H.tolist(),
		M: result.M.tolist()
	})
})
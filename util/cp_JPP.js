const { JPP } = require('../util/process.js')
var nj = require('numjs')

process.on('message', function (data) {

	//JPP algoritmo requiere bastante uso del CPU, por eso se ejecuta en otro proceso
	var result = JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
	
	process.send(result)

})
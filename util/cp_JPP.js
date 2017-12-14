const { JPP } = require('../util/process.js')
var nj = require('numjs')

process.on('message', function (data) {

	var r = nj.array( cleanM( data.r ))
	var x = nj.array( cleanM( data.x ))

	var result = JPP(x, r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
	//console.log(result)

	process.send({
		W: result.W.tolist(),
		H: result.H.tolist(),
		M: result.M.tolist()
	})

})

//Verifica que una matriz no tenga valores diferentes de numeros
function cleanM(matrix) {
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			if (typeof matrix[i][j] !== "number")
				matrix[i][j] = 0.000000001
		}
	}

	return matrix
}

var nj = require('numjs')
const { JPP, processPromise } = require('../util/process.js')

process.on('message', function (d) {
	var k = d.k
	var alpha = 10000000
    var lambda = d.lambda
    var epsilon = 0.01
    var maxiter = 100

    var setPalabras = new Set([...d.data_1.setPalabras, ...d.data_2.setPalabras])
	
	var X_1 = []
	var X_2 = []

	console.time("Calculo tfidf")

	setPalabras = [...setPalabras]

	var p1 = processPromise(`${__dirname}/cp_tfidf.js`, {setPalabras, corpus: d.data_1.corpus})
	var p2 = processPromise(`${__dirname}/cp_tfidf.js`, {setPalabras, corpus: d.data_2.corpus})

	Promise.all([p1, p2])
		.then(X => {

			console.timeEnd("Calculo tfidf")

			X_1 = nj.array( cleanM( X[0] )).T
			X_2 = nj.array( cleanM( X[1] )).T

			var r_1 = nj.random([k, X_1.shape[1]])

			X_1 = X_1.tolist()
			X_2 = X_2.tolist()	

			console.time("jpp")

			var jpp_1 = JPP(X_1, r_1, k, alpha, lambda, epsilon, maxiter)
			var jpp_2 = JPP(X_2, jpp_1.H, k, alpha, lambda, epsilon, maxiter)

			console.timeEnd("jpp")

			console.time("topicos")

			var topicos_1 = extraerTopicos(jpp_1.H, setPalabras)
			var topicos_2 = extraerTopicos(jpp_2.H, setPalabras)	

			console.timeEnd("topicos")

			process.send({M: jpp_2.M, topicos_1, topicos_2})	

		})
		.catch(err => process.send(err))	
})


function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort((a, b) => inp[b] - inp[a]) // descending sort the output array
            outp.pop() // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

function extraerTopicos (h, setPalabras) {
	var topicos = []

    for (var i = 0; i < h.length; i++)
        topicos.push( findIndicesOfMax(h[i], 7) )//[3,45,8,5,3], [3,4,6,987,2], [3,4,6,78,8]

    for (var i = 0; i < topicos.length; i++)
    	for (var j = 0; j < topicos[i].length; j++)
    		topicos[i][j] = setPalabras[topicos[i][j]]   

    return topicos
}

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
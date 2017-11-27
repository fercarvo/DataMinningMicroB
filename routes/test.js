var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser')

module.exports = router

const { longCompute, processPromise, JPP } = require('../util/process.js')
var nj = require('numjs')

//Performance test multi hilo
router.get("/resultado", function(req, res, next) {
	//var x = nj.array([[1,2,3], [4,5,6], [7,8,9]])
	var x = matrizAleatoria(50, 30, 10, 100)
	//var r = nj.array([[1,1,1], [2,2,2], [3,3,3]])
	var r = matrizAleatoria(5, 30, 10, 100)
	var k = 5
	//var k = 3
	var alpha = 10000000
	var lambda = 0.05
	var epsilon = 0.01
	var maxiter = 100
	var verbose = false
	var resultado = JPP(x, r, k, alpha, lambda, epsilon, maxiter)

	res.json(resultado.M.tolist())
	
})


//Performance test 1 hilo
router.get("/test1", function(req, res, next) {

	var begin = Date.now()

	longCompute(" 1")
	longCompute(" 2")
	longCompute(" 3")
	longCompute(" 4")

	return res.send("Performance time: " + (Date.now() - begin)/1000 + "s")

})

//Pruebas
/*var num = 8
var matrizA = nj.array([[2, 3],[6,7]])
var num = [3]
*/
function matrizAleatoria(N , M, min, max) {
	X = []

	for (var i = 0; i < N; i++) {
		var columna = []
		for (var j = 0; j < M; j++) {
			columna.push(Math.floor(Math.random()*(max-min+1)+min))
		}
		X.push(columna)
	}

	return nj.array(X)
}


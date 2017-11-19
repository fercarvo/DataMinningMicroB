var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser')

module.exports = router

const { longCompute, processPromise, JPP } = require('../util/process.js')
var nj = require('numjs')

//Performance test multi hilo
router.get("/test0", function(req, res, next) {

	var begin = Date.now()

	var proc = []

	proc.push( processPromise(__dirname + '/../util/childProcess.js', " 1") )
	proc.push( processPromise(__dirname + '/../util/childProcess.js', " 2") )
	proc.push( processPromise(__dirname + '/../util/childProcess.js', " 3") )
	proc.push( processPromise(__dirname + '/../util/childProcess.js', " 4") )

	
	Promise.all(proc).then(function (){
		res.send("Performance time: " + (Date.now() - begin)/1000 + "s")
	})
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

var x = nj.array([[1,2,3], [4,5,6], [7,8,9]])
//var x = matrizAleatoria(50, 30, 10, 100)
var r = nj.array([[1,1,1], [2,2,2], [3,3,3]])
//var r = matrizAleatoria(60, 30, 10, 100)
//var k = 60
var k = 3
var alpha = 10000000
var lambda = 0.05
var epsilon = 0.01
var maxiter = 100
var verbose = false
//console.log("shape", x.shape)
/*
console.log("x", x)
console.log("r", r)
console.log("k", k)
console.log("alpha", alpha)
console.log("lambda", lambda)
console.log("epsilon", epsilon)
console.log("maxiter", maxiter)
console.log("verbose", verbose)
*/
console.time("tiempo")

console.log("EL JPP es: ", JPP(x, r, k, alpha, lambda, epsilon, maxiter, verbose))

console.timeEnd("tiempo")

/*
//console.log("prueba random", matriz)
console.log('matrizA: ', matrizA)
console.log('sumatoria: ', matrizA.sum())
console.log('diagonal: ', matrizA.diag())
console.log('suma de diagonal: ', matrizA.diag().sum())
*/
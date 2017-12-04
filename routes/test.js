var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser')

module.exports = router

const { longCompute, processPromise, JPP, quitarAcentos } = require('../util/process.js')
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
	if (!N || !M || !min || !max)
		throw new Error("Faltan parametros...")

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


//var x = nj.array([[1,2,3], [4,5,6], [7,8,9]])
//var r = nj.array([[1,1,1], [2,2,2], [3,3,3]])
//var k = 3

function valores() {
	return {
		x: matrizAleatoria(20, 10000, 10, 100).tolist(),
		r: matrizAleatoria(5, 10000, 10, 100).tolist(),
		k: 5,
		alpha: 10000000,
		lambda: 0.05,
		epsilon: 0.01,
		maxiter: 100,
		verbose: false	
	}
}

function valores2() {
	return {
		x: matrizAleatoria(20, 10000, 10, 100),
		r: matrizAleatoria(5, 10000, 10, 100),
		k: 5,
		alpha: 10000000,
		lambda: 0.05,
		epsilon: 0.01,
		maxiter: 100,
		verbose: false	
	}
}

/*console.time("primero")
processPromise(__dirname + '/../util/cp_JPP.js', valores()).then(function(result){

	result = {
		W: nj.array( result.W),
		H: nj.array( result.H),
		M: nj.array( result.M)
	}

	console.log(result)
	console.timeEnd("primero")
})*/
//var procesos = []
/*
console.time("performance")

processPromise(`${__dirname}/../util/cp_JPP.js`, valores()).then(function(result){
	result = {
		W: nj.array( result.W),
		H: nj.array( result.H),
		M: nj.array( result.M)
	}

	console.log(result)
	console.timeEnd("performance")
})
*/
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))
//procesos.push( processPromise(__dirname + '/../util/cp_JPP.js', valores()))

/*Promise.all(procesos).then(function(){
	console.log("\nEn paralelo: " + procesos.length + " proceso/s")
	console.timeEnd("performance")
})*/

/*var data = valores2()
console.time("performance")
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 1 proceso" )
console.timeEnd("performance")

console.time("performance2")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 2 procesos" )
console.timeEnd("performance2")

console.time("performance3")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 3 procesos" )
console.timeEnd("performance3")

console.time("performance4")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 4 procesos" )
console.timeEnd("performance4")

console.time("performance5")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 5 procesos" )
console.timeEnd("performance5")*/


/*console.time("performance6")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 6 procesos" )
console.timeEnd("performance6")


console.time("performance7")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 7 procesos" )
console.timeEnd("performance7")


console.time("performance8")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 8 procesos" )
console.timeEnd("performance8")


console.time("performance9")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 9 procesos" )
console.timeEnd("performance9")

console.time("performance10")
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
data = valores2()
JPP(data.x, data.r, data.k, data.alpha, data.lambda, data.epsilon, data.maxiter)
console.log("\nEn serie: 10 procesos" )
console.timeEnd("performance10")*/


var cadena = quitarAcentos("Hola cancióñ, votacíon, LÉnïn Ágora, úbÚntü étimología")

console.log(cadena)
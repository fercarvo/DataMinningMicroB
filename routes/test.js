var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser')

module.exports = router

const { longCompute, processPromise } = require('../util/process.js')
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

var b = nj.array([[2,2,2], [5,5,5]])

var c = nj.array([[2,2,2], [5,5,5]])


console.log("dot", b.add(c))

var xx = b.multiply(100)
console.log("max", (c, 5).max())

console.log("filas",b.shape[0])
console.log("columnas",b.shape[1])
//b = nj.random([10,60])
//c = nj.random([10,60])
//b.set(0,0,1)
//console.log(b.tolist(), b.get(3.,3))
console.log("b", b)
console.log("c", c)
console.log("producto punto", tr(b,c))


function tr(A, B) {
	A = A.tolist()
	B = B.tolist()

	var suma = 0
	var multiplicacion;

	for (var fila = 0; fila < A.length; fila++) {
		for (var columna = 0; columna < A[0].length; columna++) {
			multiplicacion = A[fila][columna] * B[fila][columna]
			A[fila][columna] = multiplicacion
			suma += multiplicacion		
		}
	}

	return nj.array(A)
}
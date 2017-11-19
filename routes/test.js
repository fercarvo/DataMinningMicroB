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

var num = 8
var matrizA = nj.array([[2, 3],[6,7]])
var num = [3]


console.log('matrizA: ', matrizA)
console.log('sumatoria: ', matrizA.sum())
console.log('diagonal: ', matrizA.diag())
console.log('suma de diagonal: ', matrizA.diag().sum())

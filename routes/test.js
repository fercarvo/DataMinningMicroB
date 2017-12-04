var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser')



const { cleaner, longCompute, processPromise, JPP } = require('../util/process.js')
var nj = require('numjs')

var natural = require('natural')
var TfIdf = natural.TfIdf 
var corpus = new TfIdf()
var corpus2 = new TfIdf()

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
function matrizAleatoria(N , M) {
	//if (!N || !M || !min || !max)
		//throw new Error("Faltan parametros...")

	X = []

	for (var i = 0; i < N; i++) {
		var columna = []
		for (var j = 0; j < M; j++) {
			columna.push(Math.random())
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
		r: matrizAleatoria(5, 10000, 0, 1).tolist(),
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




function concatenar(doc){
	var words = []

	for (tweet of doc) { //Se concatenan todos los array de palabras de cada twwet
		words = words.concat(tweet.clean_data)
	}

	return words
}

function contador (words){
	var counter = {}

	for (word of words) { //Cuento las veces que se repite cada palabra en el documento
		if (counter[word]){
			counter[word]++
		} else {
			counter[word] = 1
		}
	}

	return counter
}

var tweets = JSON.parse( fs.readFileSync(__dirname + "/../DB/tweets/prueba.json", 'utf8') )


for (tweet of tweets) {
	tweet.clean_data = cleaner(tweet.tweet)
}


var doc_1 = tweets.slice(0, 35)
doc_1 = concatenar(doc_1)

var doc_2 = tweets.slice(35, 70)
doc_2 = concatenar(doc_2)


var palabras_corpus = doc_1.concat(doc_2)
palabras_corpus = contador(palabras_corpus)
//console.log(Object.keys(palabras_corpus).length)

//corpus = []

doc_1 = cadena(doc_1)
doc_2 = cadena(doc_2)

corpus.addDocument(doc_1)
corpus.addDocument(doc_2)

var X = []

for (palabra in palabras_corpus) {
	var fila = []
	//console.log("*******************", palabra)
	corpus.tfidfs(palabra, function(i, resultado){
		//console.log(`document ${i} is ${resultado}`)
		fila.push(resultado)
	})
	X.push(fila)
}

//console.log(X.length)
//console.log(X[0].length)

var matrizX = nj.array(X)
matrizX = matrizX.T


var datos = {
	x: matrizX,
	r: matrizAleatoria(5, matrizX.shape[1], 1, 2),
	k: 5,
	alpha: 10000000,
	lambda: 0.05,
	epsilon: 0.01,
	maxiter: 100,
	verbose: false	
}

var resultado = JPP(datos.x, datos.r, datos.k, datos.alpha, datos.lambda, datos.epsilon, datos.maxiter, datos.verbose)
var H = resultado.H

console.log(resultado.M.tolist())













var doc_3 = tweets.slice(70, 100)
doc_3 = concatenar(doc_3)

var doc_4 = tweets.slice(100, 140)
doc_4 = concatenar(doc_4)


var palabras_corpus2 = doc_3.concat(doc_4)
palabras_corpus2 = contador(palabras_corpus2)
//console.log(Object.keys(palabras_corpus).length)

//corpus = []

doc_3 = cadena(doc_3)
doc_4 = cadena(doc_4)

corpus2.addDocument(doc_3)
corpus2.addDocument(doc_4)

var X2 = []

for (palabra in palabras_corpus2) {
	var fila = []
	//console.log("*******************", palabra)
	corpus2.tfidfs(palabra, function(i, resultado){
		//console.log(`document ${i} is ${resultado}`)
		fila.push(resultado)
	})
	X2.push(fila)
}

//console.log(X.length)
//console.log(X[0].length)

var matrizX2 = nj.array(X2)
matrizX2 = matrizX2.T













var datos2 = {
	x: matrizX2,
	r: H,
	k: 5,
	alpha: 10000000,
	lambda: 0.05,
	epsilon: 0.01,
	maxiter: 100,
	verbose: false	
}

var resultado2 = JPP(datos.x, datos.r, datos.k, datos.alpha, datos.lambda, datos.epsilon, datos.maxiter, datos.verbose)
var H2 = resultado2.H.tolist()

console.log(resultado2.M.tolist())


var grafico = resultado2.M.tolist()


router.get("/bla2", function(req, res, next){
	return res.json(grafico)
})

router.get("/matrizH", function(req, res, next){
	return res.json(H2)
})






//corpus.push(doc_2)


function cadena(array){
	var cadena = ""
	for (word of array) {
		cadena = cadena + " " + word
	}

	return cadena
}

//console.log(corpus)




//console.log(tweets)

module.exports = router
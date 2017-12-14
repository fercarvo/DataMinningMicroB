var router = require('express').Router()
var mongoose = require('mongoose')
var moment = require('moment');
var async = require('async')
const { cleaner, processPromise } = require('../util/process.js')
var nj = require('numjs')
var nj = require('numjs')
var natural = require('natural')
var TfIdf = natural.TfIdf 


var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')


router.get("/corpus/today", function (req, res, next){

	var start = moment.utc().startOf('day').toDate()
	var end = moment.utc().endOf('day').toDate()

	Corpus.findOne({fecha: {$gte: start, $lt: end}}).exec()
	.then(function (corpus){

		getDocuments(corpus).then(function (docs) {
			corpus = corpus.toObject()
			delete corpus.__v
			corpus.documents = docs

			return res.json(corpus)

		}).catch(function (error) {
			return next(error)
		})

	})
	.catch(function (error){
		return next(error)
	})
})

router.get("/corpus", function (req, res, next){
	Corpus.find({}).exec().then(function (docs){
		return res.json(docs)

	}).catch(function (error){
		return next(error)
	})
})

router.get("/corpus/:id/matrix", function (req, res, next) {

	var c_data = {
		_id: req.params.id
	}

	getX(c_data).then(function(data) {
		return res.json(data)

	}).catch((error) => {
		return next(error)
	})
})


router.get("/corpus/:id/jpp", function (req, res, next) {

	var c_data = {
		_id: req.params.id
	}

	getX(c_data).then(function(data) {

		var k = 6
        //var x = nj.random([7, 13000])
        var x = nj.array(data.matrix_X) 
        var r = nj.random([k, x.shape[1]])
        var alpha = 10000000
        var lambda = 0.05
        var epsilon = 0.01
        var maxiter = 100
        //var verbose = false

        x = x.tolist()
        r = r.tolist()

		processPromise(__dirname + "/../util/cp_JPP.js", {k, x, r, alpha, lambda, epsilon, maxiter})
			.then(function (data) {
				return res.json(data)
			})
			.catch(function (error) {
				return next(error)

			})

	}).catch((error) => {
		return next(error)
	})
})


//FUncion que recibe un docpus y devuelve todos sus documentos con sus respectivos tweets
function getDocuments(corpus) {

	var data = []

	return new Promise(function (resolve, reject) {
		Document.find({_corpus: corpus._id}).exec()
		.then(function (documentos) {

			for (doc of documentos) {
				var obj = doc.toObject()
				delete obj._corpus
				delete obj.__v
				data.push(obj)
			}

			eachParallel(data, function (documento, res, rej) {

				getTweets(documento).then(function (tweets) {
					documento.tweets = tweets
					res()

				}).catch(function (error) {
					rej(error)

				})


			}).then(function () {
				return resolve(data)

			}).catch(function (error){
				return reject(error)

			})

		}).catch(function (error){
			return reject(error)

		})
	})
}


//Funcion que recibe un documento y devuelve todos sus tweets
function getTweets(doc) {
	var data = []

	return new Promise(function (resolve, reject) {
		Tweet.find({_document: doc._id}).exec()
		.then(function (tweets) {

			for (tweet of tweets) {
				var obj = tweet.toObject()
				delete obj._document
				delete obj.__v
				delete obj._id
				data.push(obj)
			}

			return resolve(data)

		})
		.catch(function (error) {
			return reject(error)

		})
	})
}


//Ejecuta en serie todas las operaciones
function eachSeries(array, fn) {
	return new Promise(function (resolveGlobal, rejectGlobal) {

		var promises = []
		var next = 0

		fn(array[next], resolveObj, rejectObj)

		function resolveObj(data) {

			promises.push( Promise.resolve(data) )

			next++

			if (next >= array.length) {
				Promise.all(promises).then(function (data) {
					resolveGlobal(data)
				}).catch(function (error) {
					rejectGlobal(error)
				})
			} else {
				fn(array[next], resolveObj, rejectObj)
			}

		}

		function rejectObj(error) {
			return rejectGlobal(error)
		}

	})
}

//Ejecuta en paralelo todas las operaciones
function eachParallel(array, fn) {
	return new Promise(function (resolveGlobal, rejectGlobal) {

		var promises = []

		for (obj of array ) {
			fn(obj, resolveObj, rejectObj)
		}

		function resolveObj(data) {
			promises.push( Promise.resolve(data) )

			if (promises.length == array.length) {
				Promise.all(promises).then(function (data) {
					resolveGlobal(data)
				}).catch(function (error) {
					rejectGlobal(error)
				})
			}

		}

		function rejectObj(error) {
			rejectGlobal(error)
		}	

	})
}

//Funcion que recibe un crpus y retorna una promise con su matrix X procesada
function getX(corpus_data) {
	return new Promise ((resolve, reject) => {

		var corpus = new TfIdf()
		console.log("Procesando corpus...")

		getDocuments(corpus_data).then((documentos) => {

			var palabras_corpus = [] //Todas las palabras del corpus concatenadas doc_1.concat(doc_2)
			var matrix_X = []

			//Se procesa cada tweet, steaming, etc..
			for (doc of documentos) {

				doc.words = [] //Todas las palabras de un documento
				doc.cadena = "" //Todas las palabras del doc separadas por un espacio

				for (tweet of doc.tweets) {
					//console.log("asdasda", tweet.tweet)
					tweet.clean_data = cleaner(tweet.tweet)
					doc.words = doc.words.concat(tweet.clean_data) //Se concatenan todos los clean data en doc.words
					doc.cadena += doc.words.join(' ') //Se unen todas las palabras en un solo string 
				}

				corpus.addDocument(doc.cadena)

				palabras_corpus = palabras_corpus.concat(doc.words) //Se concatenan todas las palabras de todos los docs				
			}

			palabras_corpus = contador(palabras_corpus)

			for (palabra of palabras_corpus) {
				var fila = []

				corpus.tfidfs(palabra, (i, resultado) => {
					fila.push(resultado)
				})

				matrix_X.push(fila)
			}

			matrix_X = nj.array(matrix_X)
			matrix_X = matrix_X.T
			matrix_X = matrix_X.tolist()

			return resolve({matrix_X, palabras_corpus})

		}).catch((error) => {
			reject(error)
		})
	})

	//Recibe array de string, devuelve dicccionario de cada palabra con su contador
	function contador (words){
		var counter = {}
		var palabras = []

		for (word of words) { //Cuento las veces que se repite cada palabra en el documento
			if (counter[word]){
				counter[word]++
			} else {
				counter[word] = 1
			}
		}

		for (palabra in counter)
			palabras.push(palabra)		

		return palabras
	}
}


module.exports = router;
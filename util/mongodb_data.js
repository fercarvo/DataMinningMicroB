var mongoose = require("mongoose")
var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')
const { eachParallel, processPromise, cleanM, isToday } = require('../util/process.js')


module.exports = { getDocuments, getX, getJPP }

//FUncion que recibe un corpus y devuelve todos sus documentos con sus respectivos tweets
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


//Funcion que recibe un corpus y retorna una promise con su matrix X procesada,
//Usa child process para performance
function getX(corpus_data) {
	return new Promise(function (resolve, reject){

		Corpus.findOne({_id: corpus_data._id}).exec().then((corpus)=> {

			if (corpus.X.length>0 && !isToday(corpus.fecha))
				return resolve({matrix_X: corpus.X, palabras_corpus: corpus.palabras})

			getDocuments(corpus_data).then((documentos)=> {

				console.log("Antes de process promise")

				processPromise(`${__dirname}/cp_x_matrix.js`, documentos)
					.then((data)=> {

						data.matrix_X = cleanM(data.matrix_X)

						if (!isToday(corpus.fecha)) {
							corpus.X = data.matrix_X
							corpus.palabras = data.palabras_corpus
							corpus.save()
						}

						return resolve(data)
					})
					.catch((error)=> {
						return reject(error) //Error al procesar la matriz X
					})

			}).catch((error)=> {
				reject(error) //Error al obtener los docs de la BD
			})



		}).catch((error)=> {
			return reject(error)
		})
	})
}

function getJPP(x, r, k, alpha, lambda, epsilon, maxiter) {
	return new Promise(function (resolve, reject) {

		processPromise(`${__dirname}/cp_JPP.js`, {x, r, k, alpha, lambda, epsilon, maxiter})
			.then(function (data) {

				for (key in data)
					data[key] = cleanM(data[key])

				resolve(data)
			})
			.catch(function (error){
				reject(error)
			})
	})
}
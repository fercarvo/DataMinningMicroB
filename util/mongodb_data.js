var mongoose = require("mongoose")
var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')
const { eachParallel, processPromise, cleanM } = require('../util/process.js')


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

		getDocuments(corpus_data).then((documentos) => {

			processPromise(`${__dirname}/cp_x_matrix.js`, documentos)
				.then(function (data) {
					data.matrix_X = cleanM(data.matrix_X)
					resolve(data)
				})
				.catch(function (error) {
					reject(error)
				})

		}).catch(function (error) {
			reject(error)
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



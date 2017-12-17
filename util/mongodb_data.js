var mongoose = require("mongoose")
var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')
var moment = require('moment')
const { eachSeries, eachParallel, processPromise, cleanM, isToday } = require('../util/process.js')


module.exports = { getDocuments, getX, getJPP, processXmatrices }

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

			}).catch(error => reject(error) )

		}).catch(error => reject(error))
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
		.catch(error => reject(error))
	})
}


//Funcion que recibe un corpus y retorna una promise con su matrix X procesada,
//Usa child process para performance
function getX(corpus_data) {
	return new Promise(function (resolve, reject){

		Corpus.findOne({_id: corpus_data._id}).exec(function (error, corpus){

			if (error)
				return reject(error)

			getDocuments(corpus_data).then((documentos)=> {

				processPromise(`${__dirname}/cp_x_matrix.js`, documentos)
					.then((data)=> {

						data.X = cleanM(data.X) //Se limpia la matriz X de datos no numericos

						corpus.X = data.X
						corpus.palabras = data.palabras

						return resolve(corpus.toObject())

					})
					.catch(error => reject(error)) //Error al procesar la matriz X

			}).catch(error => reject(error))  //Error al obtener los docs de la BD
		})
	})
}

function getJPP(x, r, k, alpha, lambda, epsilon, maxiter) {
	return new Promise(function (resolve, reject) {

		processPromise(`${__dirname}/cp_JPP.js`, {x, r, k, alpha, lambda, epsilon, maxiter})
			.then(function (data) {

				for (key in data)
					data[key] = cleanM(data[key]) //Se itera las 3 matrices para limpiar datos no numericos

				return resolve(data)
			})
			.catch(error => reject(error))
	})
}

//No usar, no guarda datos
function processXmatrices () {/*
	return new Promise(function (resolve, reject){
		var start = moment.utc().startOf('day').toDate() //Inicio del dia

		Corpus.find({fecha: {$lt: start}}).exec().then(function (data){ //Busca los que no pertenezcan a hoy

			console.log("\nCorpuses a procesar", data.length)

			eachSeries(data, function(corpus, next, error){

				console.time(`Corpus ${corpus._id}...`)

				getX(corpus)
					.then(()=> { 
						console.timeEnd(`Corpus ${corpus._id}...`)
						next() 
					})
					.catch((e)=> { error(e) })

			}).then(()=> {
				return resolve()
			}).catch((error)=> {
				return reject(error)
			})





		}).catch(function(error) { //Error mongoDB Corpus Model
			return reject(error)
		})
	}) 
*/} 
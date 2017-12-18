var mongoose = require("mongoose")
var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')
var moment = require('moment')
const { eachSeries, eachParallel, processPromise, cleanM, isToday } = require('../util/process.js')

module.exports = { getDocuments, getX, getJPP }

/*	fn_name getDccuments

	@corpus_id string, id del corpus al obtener documentos con tweets

	return Promise
		on resolve([Document]) Array de Document con sus Tweet
		on reject(error) el error que causo la falla 
*/
function getDocuments(corpus_id) {
	return new Promise(function (resolve, reject) {
		Document.find({_corpus: corpus_id}, "identificador")
		.exec()
			.then(function (documentos) {

				documentos = documentos.map(d => d.toObject())

				eachParallel(documentos, function (documento, next, error) { //Loop en paralelo para cada doc

					Tweet.find({_document: documento._id}, "tweet").exec()
						.then(function (tweets) {
							documento.tweets = tweets.map(t => t.toObject())
							next()

						}).catch(error => error(error))

				}).then(() => resolve(documentos) ) //Fin del loop, Promise.resolve(documentos)
				.catch(e_loop => reject(e_loop) ) //Error en el loop

			}).catch(e_db => reject(e_db))
	})
}


/*	fn_name getX

	@idCorpus string, id del corpus al obtener documentos con tweets

	return Promise
		on resolve({_id, X, palabras}) Object corpus, con la matriz X [[tfidf]] y Array de palabras [string]
		on reject(error) el error que causo la falla 
*/
function getX(idCorpus) {
	return new Promise(function (resolve, reject){

		Corpus.findOne({_id: idCorpus}).exec()
			.then((corpus) => {

				corpus = corpus.toObject()

				getDocuments(corpus._id).then((docsArr)=> {

					processPromise(`${__dirname}/cp_x_matrix.js`, docsArr)
						.then((data)=> {

							corpus.X = cleanM(data.X)
							corpus.palabras = data.palabras

							return resolve(corpus)

						})
						.catch(error => reject(error)) //Error al procesar la matriz X

				}).catch(error => reject(error))  //Error al obtener los docs de la BD

			}).catch(e => reject(e)) //Error DB
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
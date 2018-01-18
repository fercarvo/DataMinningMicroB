const mongoose = require("mongoose")
const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')
const moment = require('moment')
const { eachSeries, eachParallel, processPromise, each } = require('../util/process.js')

module.exports = { getDocuments, getJPP }

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


function getJPP(corpus1, corpus2, k, lambda) {
	return new Promise(function (resolve, reject){
		console.log('Iniciando proceso de corpus')
		console.time(`X of ${corpus1}/${corpus2}`)
		var c1 = getX(corpus1)
		var c2 = getX(corpus2)

		Promise.all([c1, c2])
		.then(arr_data => {
			console.timeEnd(`X of ${corpus1}/${corpus2}`)

			var data_1 = arr_data[0]
			var data_2 = arr_data[1]

			processPromise(`${__dirname}/cp_jpp.js`, {data_1, data_2, k, lambda})
				.then(resultado => resolve(resultado))
				.catch(e => reject(e))
		})
		.catch(e => reject(e))
	})
}


function getX(corpus_id) {
	return new Promise(function (resolve, reject){
		Document.find({_corpus: corpus_id}).exec((error, documentos)=> {
			if (error)
				return reject(error)

			documentos = documentos.map(doc => doc.toObject())

			if (!documentos.some(doc => doc.tweets.length > 70))
				return reject(`${corpus_id} no posee tweets`)

			processPromise(`${__dirname}/cp_corpus_2.js`, documentos)
				.then(data => resolve(data))
				.catch(error => reject(error))
		})
	})
}
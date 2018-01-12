const mongoose = require("mongoose")
const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')
const moment = require('moment')
const { eachSeries, eachParallel, processPromise, cleanM, isToday, each } = require('../util/process.js')

module.exports = { getDocuments, getJPP, getXprocess, getCorpus }

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


/*	Retorna Promise.Resolve(lista_corpus) 
 	[{ _id: idcorpus,
 		fecha: Date,
		documentos: [
			{
				identificador: 23,
				tweets : [
					tweet: "string data"
				]
			},...
		]
	},...]
*/
function getAllCorpus () {
	return new Promise(function (resolve, reject){
		
		var start = moment.utc().startOf('day').toDate() //Inicio del dia

		Corpus.find({fecha: {$lt: start}}, "fecha").exec()
			.then((arrCorpus)=> { 

				arrCorpus = arrCorpus.map(d => d.toObject())

				eachParallel(arrCorpus, (corpus, next, error)=> {

					getDocuments(corpus._id)
						.then(docs => {
							corpus.documentos = docs
							next()
						})
						.catch(e => error(e))
				})
				.then((res) => resolve(arrCorpus))	
				.catch(e => reject(e))

			}).catch(error => reject(error))
	})
}




function getCorpus () {
	return new Promise(function (resolve, reject){
		
		var start = moment.utc().startOf('day').toDate() //Inicio del dia
		//var corpus_cache = []
		var cores = require('os').cpus().length

		Corpus.find({fecha: {$lt: start}}, "fecha").exec()
			.then((arrCorpus)=> { 

				arrCorpus = arrCorpus.map(d => d.toObject())

				console.log("\nCorpus's a procesar", arrCorpus.length)

				each(arrCorpus, function(corpus, next, error){

					getDocuments(corpus._id)
						.then(docs => {
							corpus.documentos = docs

							getXprocess(corpus)
								.then(data => {
									console.log("termino x", corpus._id)
									next(data)
								})
								.catch(e => error(e))
						})
						.catch(e => error(e))					

				}, cores)
					.then(data => resolve(data))
					.catch(e => reject(e)) //Error de procesamiento

			}).catch(e => reject(e)) //Error de BDD
	})
}



/*	Recibe los datos para el JPP y devuelve {W, H, M}
*/
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


/*	Recibe un corpus sin procesar y retorna un
	Promise.resolve( {X: [[],...], palabras_corpus: [string,...]} )
*/
function getXprocess(corpus) {
	return new Promise(function (resolve, reject){

		processPromise(`${__dirname}/cp_corpus.js`, corpus.documentos)
			.then((data)=> {

				corpus.setPalabras = data.setPalabras
				corpus.documentos = null
				corpus.corpus = data.corpus


				return resolve(corpus)

			})
			.catch(error => reject(error)) //Error al procesar la matriz X
	})
}





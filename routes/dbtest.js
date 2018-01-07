const router = require('express').Router()
const nj = require('numjs')
const mongoose = require("mongoose")
const moment = require("moment")
const cores = require('os').cpus().length

const { getJPP, getAllCorpus, getXprocess } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel, processPromise } = require('../util/process.js')

const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')

var corpus_cache = [] //Se calculan al inicio los corpus con su matriz X y palabras

router.use((req, res, next)=> {
	res.set('Cache-Control', `public, max-age=${60*5}`)
	next()
})

getAllCorpus().then(arrCorpus => {

	console.log("\nCorpus's a procesar", arrCorpus.length)

	eachSeries(arrCorpus, function(corpus, next, error){

		getXprocess(corpus)
			.then(corpus => {
				corpus_cache = [...corpus_cache, corpus]
				next()
			})
			.catch(e => error(e))

	}, cores)
		.then(() => { 

			for (corpus of corpus_cache){
				console.log(corpus.setPalabras.slice(0, 5))
			}

		 })
		.catch(e => console.log("Error procesamiento corpus", e))
})


//Se obtienen todos los corpus recopilados
router.get("/corpus", function (req, res, next){

	Corpus.find({}, "fecha palabras").exec()
		.then(docs => res.json(docs))
		.catch(error => next(error))

})


//Se obtienen todos los documentos de un corpus
router.get("/corpus/:id/documentos", function (req, res, next){

	Document.find({_corpus: req.params.id})
	.exec()
		.then(docs => res.json(docs))
		.catch(error => next(error))
})



//Se obtiene la matriz X y sus palabras de un corpus
router.get("/corpus/:id/matrix", function (req, res, next) {

	var data = corpus_cache.find(corpus => corpus._id.toString()===req.params.id.toString())

	if (data)
		return res.json(data)

	return next(new Error("Información aun en procesamiento, espere"))
})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/corpus/:id1/:id2/jpp/:k", function (req, res, next) {

	var data_1 = corpus_cache.find(corpus => corpus._id.toString()===req.params.id1.toString())
	var data_2 = corpus_cache.find(corpus => corpus._id.toString()===req.params.id2.toString())

	const k = parseInt(req.params.k) || 6


	if (!data_1 || !data_2)
		return next(new Error("Información aun en procesamiento, espere"))

	processPromise(`${__dirname}/../util/cp_jpp.js`, {data_1, data_2, k})
		.then(resultado => {

			return res.json(resultado)

		})
		.catch(error => next(error))    
})

module.exports = router;
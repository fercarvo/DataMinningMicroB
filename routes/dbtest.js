const router = require('express').Router()
const nj = require('numjs')
const mongoose = require("mongoose")
const moment = require("moment")
const cores = require('os').cpus().length

const { getJPP, getAllCorpus, getXprocess } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel } = require('../util/process.js')

const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')

var corpus_cache = [] //Se calculan al inicio los corpus con su matriz X y palabras

router.use((req, res, next)=> {
	res.set('Cache-Control', `public, max-age=${60*5}`)
	next()
})

console.time("\nPulling from DB")
getAllCorpus().then(arrCorpus => {

	console.timeEnd("\nPulling from DB")

	console.log("\nCorpus's a procesar", arrCorpus.length)
	console.time("\nFin procesamiento de X's")

	eachSeries(arrCorpus, function(corpus, next, error){

		console.time(`Procesamiento de ${corpus._id} tardo`)

		getXprocess(corpus)
			.then(corpus => {
				console.timeEnd(`Procesamiento de ${corpus._id} tardo`)
				corpus_cache = [...corpus_cache, corpus]
				next()
			})
			.catch(e => error(e))

	}, cores)
		.then(() => { console.timeEnd("\nFin procesamiento de X's") })
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
router.get("/corpus/:id/jpp/:k", function (req, res, next) {

	var data = corpus_cache.find(corpus => corpus._id.toString()===req.params.id.toString())

	if (!data)
		return next(new Error("Información aun en procesamiento, espere"))

	if (data.palabras.length <= 0 || data.X.length <= 0)
		return next(new Error("No se ha calculado aun los datos de este corpus"))

	var k = parseInt(req.params.k) || 6
    var x = nj.array(data.X)
    var r = nj.random([k, x.shape[1]])
    var alpha = 10000000
    var lambda = 0.05
    var epsilon = 0.01
    var maxiter = 100
    //var verbose = false

    x = x.tolist()
    r = r.tolist()

    getJPP(x, r, k, alpha, lambda, epsilon, maxiter)
    	.then(function (result) {
    		return res.json({JPP: result, palabras_corpus: data.palabras})

    	})
    	.catch(error => next(error))
})

module.exports = router;
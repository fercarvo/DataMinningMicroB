var router = require('express').Router()
var nj = require('numjs')
var mongoose = require("mongoose")
var moment = require("moment")
var cores = require('os').cpus().length

console.log("cores", cores)

const { getX, getJPP, getAllCorpus, getXprocess } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel } = require('../util/process.js')

var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')

var corpus_cache = [] //Se calculan al inicio los corpus con su matriz X y palabras

var start = moment.utc().startOf('day').toDate() //Inicio del dia

//Al iniciar el servidor se obtienen y calculan todas las matrices X de cada corpus
Corpus.find({fecha: {$lt: start}}).exec()
	.then((arrCorpus)=> {

		console.log("\nCorpus's a procesar", arrCorpus.length)
		console.time("procesamiento de X's")

		eachSeries(arrCorpus, function(corpus, next, error){

			console.time(`Corpus ${corpus._id}`)

			getX(corpus._id)
				.then(function(data) { 
					console.timeEnd(`Corpus ${corpus._id}`)
					corpus_cache.push(data)
					next() 
				})
				.catch(e => error(e))

		}, null)
		.then(() => { console.timeEnd("procesamiento de X's") })
		.catch(e => console.log("Error procesamiento corpus", e) )

	}).catch(e => console.log("Error BD corpus", e))


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
router.get("/corpus/:id/jpp", function (req, res, next) {

	var data = corpus_cache.find(corpus => corpus._id.toString()===req.params.id.toString())

	if (!data)
		return next(new Error("Información aun en procesamiento, espere"))

	if (data.palabras.length <= 0 || data.X.length <= 0)
		return next(new Error("No se ha calculado aun los datos de este corpus"))

	var k = 6
    var x = nj.array(data.X)
    //x = nj.random([x.shape[0], x.shape[1]]) 
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
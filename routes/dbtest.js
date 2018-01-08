const router = require('express').Router()
const nj = require('numjs')
const mongoose = require("mongoose")
const moment = require("moment")
const cores = require('os').cpus().length

const { getJPP, getCorpus, getXprocess } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel, processPromise } = require('../util/process.js')

const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')

var corpus_cache = [] //Se calculan al inicio los corpus con su matriz X y palabras

var calculo_jpp = new Map()

router.use((req, res, next)=> {
	res.set('Cache-Control', `public, max-age=${30}`)
	next()
})

console.time("procesamiento corpus")
getCorpus()
	.then(data => { corpus_cache = data, console.timeEnd("procesamiento corpus") })
	.catch(e => console.log(e))

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



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/corpus/:id1/:id2/jpp/:k/:lambda", function (req, res, next) {

	var key = `${req.params.id1} ${req.params.id2} ${req.params.k} ${req.params.lambda}`;
	var cache = calculo_jpp.get(key)

	if (cache)
		return res.json(cache)

	var data_1 = corpus_cache.find(corpus => corpus._id.toString()===req.params.id1.toString())
	var data_2 = corpus_cache.find(corpus => corpus._id.toString()===req.params.id2.toString())
	var k = parseInt(req.params.k) || 6
	var lambda = parseFloat(req.params.lambda) || 0.5 

	if (!data_1 || !data_2)
		return next(new Error("Información aun en procesamiento, espere"))

	processPromise(`${__dirname}/../util/cp_jpp.js`, {data_1, data_2, k, lambda})
		.then(resultado => {

			calculo_jpp.set(key, resultado)
			//return res.json(resultado)

		})
		.catch(error => next(error))

	next(new Error("Procesando informacion... regrese mas tarde"))

})

module.exports = router;
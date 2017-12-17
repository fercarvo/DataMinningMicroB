var router = require('express').Router()
var nj = require('numjs')
var mongoose = require("mongoose")
var moment = require("moment")

const { getX, getJPP, processXmatrices } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel } = require('../util/process.js')


var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')

var corpus_cache = []


var start = moment.utc().startOf('day').toDate() //Inicio del dia

Corpus.find({fecha: {$lt: start}}).exec((error, arr_corpus)=>{

	if (error)
		return console.log("No se pudo cargar los corpus", error)

	console.log("\nCorpuses a procesar", arr_corpus.length)

	eachParallel(arr_corpus, function(corpus, next, error){

		console.time(`Corpus ${corpus._id}`)

		getX(corpus)
			.then(function(data) { 
				console.timeEnd(`Corpus ${corpus._id}`)
				corpus_cache.push(data)
				next() 
			})
			.catch(e => error(e))

	}).then(()=> {
		console.log("Se termino de procesar los corpus")

	}).catch(error => console.log("Error procesamiento corpus", error) )
})

//Lista de corpus
router.get("/corpus", function (req, res, next){

	Corpus.find({}, "fecha palabras").exec()
		.then(docs => res.json(docs))
		.catch(error => next(error))

})



router.get("/corpus/:id/documentos", function (req, res, next){

	Document.find({_corpus: req.params.id}).exec(function(err, docs){
		if (err)
			return next(error)

		return res.json(docs)
	})
})



//Se obtiene la matriz X del corpus seleccionado
router.get("/corpus/:id/matrix", function (req, res, next) {

	var data = corpus_cache.find(corpus => corpus._id.toString()===req.params.id.toString())

	if (data)
		return res.json(data)

	return res.send("Información aun en procesamiento, espere")
})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/corpus/:id/jpp", function (req, res, next) {

	var data = corpus_cache.find(corpus => corpus._id.toString()===req.params.id.toString())

	if (!data)
		return res.send("Información aun en procesamiento, espere")

	if (data.palabras.length <= 0 || data.X.length <= 0)
		return next(new Error("No se ha calculado aun los datos de este corpus"))

	var k = 9
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
    	.catch(function (error) {
    		return next(error)
    	})
})

module.exports = router;
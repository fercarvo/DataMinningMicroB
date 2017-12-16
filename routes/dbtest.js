var router = require('express').Router()
var nj = require('numjs')
var mongoose = require("mongoose")

const { getX, getJPP, processXmatrices } = require("../util/mongodb_data.js")


var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')

var cache_all_corpus = []
var cache_matrix = []
var cache_jpp = []

/*processXmatrices().then(()=> {
	console.log("\n\nSe termino el procesamiento de las matrices X")
}).catch((error)=> {
	console.log("\n\nError procesamiento de matrices X", error)
})*/

//Lista de corpus
router.get("/corpus", function (req, res, next){

	if (cache_all_corpus.length>0) 
		return res.json(cache_all_corpus)	

	Corpus.find({}, "fecha palabras").exec(function(err, docs){
		if (err)
			return next(error)

		cache_all_corpus = docs
		return res.json(docs)
	})
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

	var cache = cache_matrix.find((corpus)=> { return corpus._id.toString()===req.params.id.toString() })

	if (cache)
		return res.json(cache)

	Corpus.findOne({_id: req.params.id}, "palabras X").exec(function (err, data){
		if (err)
			return next(err)

		cache_matrix.push(data)
		return res.json(data)
	})
})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/corpus/:id/jpp", function (req, res, next) {

	var cache = cache_jpp.find((obj)=> {return obj._id==req.params.id})

	if (cache)
		return res.json(cache)

	Corpus.findOne({_id: req.params.id}).exec(function(err, data){

		if (err)
			return next(err)

		if (data.palabras.length <= 0 || data.X.length <= 0)
			return next(new Error("No se ha calculado aun los datos de este corpus"))

		var palabras_corpus = data.palabras

		var k = 10
        //var x = nj.random([7, 13000])
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
        	.then(function (data) {

        		cache_jpp.push({JPP: data, palabras_corpus, _id: req.params.id})

        		return res.json({JPP: data, palabras_corpus})
        	})
        	.catch(function (error) {
        		return next(error)
        	})

	})
})

module.exports = router;
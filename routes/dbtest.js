var router = require('express').Router()
var nj = require('numjs')
var mongoose = require("mongoose")

const { getX, getJPP } = require("../util/mongodb_data.js")


var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')

//Lista de corpus
router.get("/corpus", function (req, res, next){
	Corpus.find({}).exec().then(function (docs){
		return res.json(docs)

	}).catch(function (error){
		return next(error)
	})
})

//Se obtiene la matriz X del corpus seleccionado
router.get("/corpus/:id/matrix", function (req, res, next) {

	setTimeout(function(){
		if (!res.headersSent)
			return res.json("EL procesamiento tardara un tiempo mas, por favor recarge la pagina en unos instantes")

	}, 20000)

	getX({_id: req.params.id}).then(function(data) {

		if (!res.headersSent)
			return res.json(data)

		return console.log("Se termino el procesamiento de X")

	}).catch((error) => {
		return next(error)
	})

})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/corpus/:id/jpp", function (req, res, next) {

	getX({_id: req.params.id}).then(function(data) {

		var palabras_corpus = data.palabras_corpus

		var k = 6
        //var x = nj.random([7, 13000])
        var x = nj.array(data.matrix_X) 
        var r = nj.random([k, x.shape[1]])
        var alpha = 10000000
        var lambda = 0.05
        var epsilon = 0.01
        var maxiter = 100
        //var verbose = false

        x = x.tolist()
        r = r.tolist()

        console.time("JPP")

        getJPP(x, r, k, alpha, lambda, epsilon, maxiter)
        	.then(function (data) {
        		console.timeEnd("JPP")
        		return res.json({JPP: data, palabras_corpus})
        	})
        	.catch(function (error) {
        		return next(error)
        	})

	}).catch((error) => {
		return next(error)
	})
})

module.exports = router;
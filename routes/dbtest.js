var router = require('express').Router()
var mongoose = require('mongoose')

var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')



function docID () {
	var targetTime = new Date()
	var tzDifference = 5 * 60 + targetTime.getTimezoneOffset()
	var offsetTime = new Date(targetTime.getTime() - (tzDifference/2) * 60 * 1000)
	var secs = offsetTime.getUTCSeconds() + (60 * offsetTime.getUTCMinutes()) + (60 * 60 * offsetTime.getUTCHours());
	return Math.floor(secs/1800)
}

router.get("/corpus/new", function(req, res, next){
	var corp = new Corpus({
		fecha: new Date()
	})

	corp.save().then(function (doc) {
		return res.json(doc)

	}).catch(function (error){
		console.log("Error al guardar corpus", error)
		return next(error)
	})
})




router.get("/document/new", function(req, res, next){

	Corpus.findOne({}).exec().then(function (corpus){
		
		var doc = new Document({
			_corpus: corpus._id,
			identificador: docID()
		})

		doc.save().then(function (doc) {
			return res.json(doc)

		}).catch(function (error){
			return next(error)

		})

	}).catch(function (error){
		return next(error)
	})

})





router.get("/corpus", function (req, res, next){
	Corpus.find({}).exec().then(function (docs){
		return res.json(docs)

	}).catch(function (error){
		return next(error)
	})


})

module.exports = router;
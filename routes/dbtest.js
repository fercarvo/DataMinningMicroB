var router = require('express').Router()
var mongoose = require('mongoose')
var moment = require('moment');
var async = require('async')


var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')


/*
function docID () {
	var targetTime = new Date()
	var tzDifference = 5 * 60 + targetTime.getTimezoneOffset()
	var offsetTime = new Date(targetTime.getTime() - (tzDifference/2) * 60 * 1000)
	var secs = offsetTime.getUTCSeconds() + (60 * offsetTime.getUTCMinutes()) + (60 * 60 * offsetTime.getUTCHours());
	return Math.floor(secs/1800)
}


function getTimeEC() {
	var targetTime = new Date()
	var tzDifference = 5 * 60 + targetTime.getTimezoneOffset()
	var offsetTime = new Date(targetTime.getTime() - (tzDifference/2) * 60 * 1000)
	return offsetTime
}

function getStart(time) {
	var date = time
	date.setHours(-5,0,0,0)
	return date
}

function getEnd(time) {
	var date = time
	date.setHours(18,59,59,999)
	return date
}*/


router.get("/corpus/today", function (req, res, next){

	var start = moment.utc().startOf('day').toDate()
	var end = moment.utc().endOf('day').toDate()

	Corpus.findOne({fecha: {$gte: start, $lt: end}}).exec()
	.then(function (corpus){

		getDocuments(corpus).then(function (docs) {
			corpus = corpus.toObject()
			delete corpus.__v
			delete corpus._id
			corpus.documents = docs

			return res.json(corpus)

		}).catch(function (error) {
			return next(error)
		})

	})
	.catch(function (error){
		return next(error)
	})
})


router.get("/document", function (req, res, next) {
	Document.find({}).exec()
	.then(function (docs) {
		return res.json(docs)
	})
	.catch(function (error) {
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


function getDocuments(corpus) {

	var data = []

	return new Promise(function (resolve, reject) {
		Document.find({_corpus: corpus._id}).exec()
		.then(function (documentos) {

			for (doc of documentos) {
				var obj = doc.toObject()
				delete obj._corpus
				delete obj.__v
				data.push(obj)
			}

			async.each(data, function(documento, callback) {

				getTweets(documento).then(function (tweets) {
					documento.tweets = tweets
					callback()

				}).catch(function (error) {
					callback(error)

				})

			}, function(err){
				if (err)
					return reject(err)

				return resolve(data)				
			})

		}).catch(function (error){
			return reject(error)

		})
	})
}


function getTweets(doc) {
	var data = []

	return new Promise(function (resolve, reject) {
		Tweet.find({_document: doc._id}).exec()
		.then(function (tweets) {

			for (tweet of tweets) {
				var obj = tweet.toObject()
				delete obj._document
				delete obj.__v
				delete obj._id
				data.push(obj)
			}

			return resolve(data)

		})
		.catch(function (error) {
			return reject(error)

		})
	})
}


module.exports = router;
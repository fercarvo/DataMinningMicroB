/*
	Esta sección se encarga de la recolección de tweets
*/
var router = require('express').Router()
/*
var Twitter = require('twitter');
var { tokens } = require('../config.js')
var { topicos, users } = require('../DB/topicos.js')
var moment = require('moment')
var mongoose = require('mongoose')
const { processTweet, isToday } = require('../util/process.js')

var Tweet = require('../models/Tweet.js')
var Corpus = require('../models/Corpus.js')
var Document = require('../models/Document.js')

var client = new Twitter({
	    consumer_key: tokens[0].consumer_key,
	    consumer_secret: tokens[0].consumer_secret,
	    access_token_key: tokens[0].access_token_key,
	    access_token_secret: tokens[0].access_token_secret
	}
)

var io = require('socket.io')( require('http').createServer().listen(3001) )

var stream = null //Streaming de tweets

var corpus = null //corpus actual
var documento = null //documento actual

//Se inicializa el corpus y documento actual
getCorpus().then(function (corpus_actual){
	getDocument(corpus_actual).then(function(doc_actual) {
		corpus = corpus_actual
		documento = doc_actual


		//stream = streamTweets()


	}).catch(printError)
}).catch(printError)
*/


function streamTweets() {

	var stream_data = {
		track: topicos(),
		locations : "-80.189855,-3.309067,-77.645968,0.446412", //Ecuador Bounding box
		follow: users()
	} 

	var stream = client.stream('statuses/filter', stream_data)

	console.log("Inicio de streamming de tweets")

	stream.on('data', function(tweet) {

		if (tweet.retweeted_status) //SI es un retweet, se rechaza todo
			return

		var pt = processTweet(tweet)

		if (docID() === documento.identificador && isToday(corpus.fecha)) { //Si el corpus es de hoy y el doc es correcto

			saveTweet(pt, documento).then(function (tweet) {
				io.emit("tweet", tweet)

			}).catch(printError)

		} else {

			corpus = null
			documento = null

			getCorpus().then(function (corpus_actual){
				getDocument(corpus_actual).then(function(doc_actual) {

					corpus = corpus_actual
					documento = doc_actual

					saveTweet(pt, documento).then(function (tweet) {
						io.emit("tweet", tweet)

					}).catch(printError)

				}).catch(printError)
			}).catch(printError)
		}

	})

	stream.on('error', function (error) {
		console.log("\n\nError streamming tweet\n\n")
	})

	return stream
}


function docID () {
	var date_id = moment.utc().toDate()
	var secs = date_id.getUTCSeconds() + (60 * date_id.getUTCMinutes()) + (60 * 60 * date_id.getUTCHours());
	return Math.floor(secs/1800)
}

/*
	@obj, tweet limpio a ser almacenado
	@documento, documento al que pertenece el tweet
*/
function saveTweet(obj, documento) {
	return new Promise(function (resolve, reject){

		if (!documento)
			return reject(new Error("No existe documento"))

		new Tweet({
			_document: documento._id,
			tweet: obj.tweet,
			id: obj.id,
			clean_data: obj.clean_data,
			usuario: obj.usuario
		})
		.save((error, tweet)=> {
			if (error)
				return reject(error)
			
			return resolve(tweet)
		})
	})
}

/*
	Funcion que obtiene el corpus del dia actual, en caso de no existir crea uno y lo devuelve
*/
function getCorpus() {
	return new Promise(function (resolve, reject) {
		var start = moment.utc().startOf('day').toDate()
		var end = moment.utc().endOf('day').toDate()

		Corpus.findOne({fecha: {$gte: start, $lt: end}}).exec((error, corpus)=> {
			if (error) 
				return reject(error)

			if (corpus)
				return resolve(corpus)

			new Corpus({fecha: moment.utc().toDate() }).save((error, saved)=> {
				if (error)
					return reject(error)

				return resolve(saved)
			})

		})
	})
}

function getDocument(corpus) {
	return new Promise(function (resolve, reject){

		if (!corpus)
			return reject("Error, no existe corpus para generar documento")

		var id = docID()

		Document.findOne({identificador: id, _corpus: corpus.id}).exec()
			.then(function (doc){
				if (doc)
					return resolve(doc)

				new Document({
					_corpus: corpus._id,
					identificador: id
				})
				.save()
				.then(documento => resolve(documento))
				.catch(error => reject(error))				
			})
	})
}

function printError(error) {
	console.log("Error", error)
}


module.exports = router
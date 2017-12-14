var router = require('express').Router()
var Twitter = require('twitter');
var { tokens } = require('../config.js')
var { topicos, users } = require('../DB/topicos.js')
var moment = require('moment')
var mongoose = require('mongoose')
const { processTweet } = require('../util/process.js')

var app = require('http').createServer()
var io = require('socket.io')(app)
app.listen(3001)

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

var stream = null //Streaming de tweets
var stream_socket = null //socket para enviar los tweets de streaming

var corpus = null //corpus actual
var documento = null //documento actual

//Se inicializa el corpus y documento actual
getCorpus().then(function (corpus_actual){
	getDocument(corpus_actual).then(function(doc_actual) {
		corpus = corpus_actual
		documento = doc_actual

	}).catch(printError)
}).catch(printError)

io.on('connection', function (socket) {
	stream_socket = socket
	console.log("bla", socket)
})


router.get("/stream/start", function(req, res, next){

	if (stream) 
		stream.destroy()

	stream = streamTweets()
	return res.send("stream... start")
})

router.get("/stream/stop", function(req, res, next) {

	if (stream) 
		stream.destroy()

	stream = null
	return res.send("stream... stop")
})


function streamTweets() {

	var stream_data = {
		track: topicos(),
		locations : "-80.189855,-3.309067,-77.645968,0.446412", //Ecuador Bounding box
		follow: users()
	} 

	var stream = client.stream('statuses/filter', stream_data)

	stream.on('data', function(tweet) {

		if (tweet.retweeted_status) //SI es un retweet, se rechaza
			return

		var pt = processTweet(tweet)
		console.log(pt)
		
		if (docID() === documento.identificador && isToday(corpus.fecha)) { //Si el corpus es de hoy y el doc es correcto

			saveTweet(pt, documento).then(function (tweet) {
				stream_socket.emit('tweet', pt) //Se envia el tweet por socket.io

			}).catch(printError)

		} else {

			getCorpus().then(function (corpus_actual){
				getDocument(corpus_actual).then(function(doc_actual) {

					corpus = corpus_actual
					documento = doc_actual

					saveTweet(pt, documento).then(function (tweet) {
						stream_socket.emit('tweet', pt) //Se envia el tweet por socket.io

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
	var date_id = new Date()
	var secs = date_id.getUTCSeconds() + (60 * date_id.getUTCMinutes()) + (60 * 60 * date_id.getUTCHours());
	return Math.floor(secs/1800)
}

/*
	@obj, tweet limpio a ser almacenado
	@documento, documento al que pertenece el tweet
*/
function saveTweet(obj, documento) {
	return new Promise(function (resolve, reject){

		new Tweet({
			_document: documento._id,
			tweet: obj.tweet,
			id: obj.id,
			clean_data: obj.clean_data,
			usuario: obj.usuario
		})
		.save()
		.then(function (tweet){
			resolve(tweet)

		})
		.catch(function (error) {
			reject(error)
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

		Corpus.findOne({fecha: {$gte: start, $lt: end}})
			.exec()
			.then(function (doc) {

				if (doc) 
					return resolve(doc) //Si existe el corpus, lo devuelvo

				
				new Corpus({
					fecha: moment.utc().toDate()
				}).save()
				.then(function (doc) { //SI no, creo uno y lo devuelvo
					return resolve(doc)

				})
				.catch(function (error){
					return reject(error)
				})
				

			}).catch(function(error) {
				return reject(error)
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
				}).save()
				.then(function (documento) {
					return resolve(documento)

				}).catch(function (error) {
					return reject(error)
				})
				
			})
	})
}

//Recibe una fecha y hora, devuelve true si es de hoy, false caso contrario
function isToday (date) {
	var start = moment.utc().startOf('day').toDate()
	var end = moment.utc().endOf('day').toDate()

	if (date >= start && date <= end) 
		return true
	
	return false
}

function printError(error) {
	console.log("Error", error)
}


module.exports = router;
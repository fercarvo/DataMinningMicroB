var router = require('express').Router()
var Twitter = require('twitter');
var { tokens } = require('../config.js')
var { topicos, users } = require('../DB/topicos.js')
var moment = require('moment');

var mongoose = require('mongoose')

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

const { processTweet } = require('../util/process.js')

var app = require('http').createServer()
var io = require('socket.io')(app);
var fs = require('fs');


var stream = null

app.listen(3001)

/*router.get("/tweets/prueba", function(req, res, next) {

	var data = JSON.parse( fs.readFileSync(`${__dirname}/../DB/tweets/prueba.json`, 'utf8') )

	return res.json(data)
})*/

var corpus = null
var documento = null

console.log("UTC time", new Date())

getCorpus().then(function (corpus_actual){
	getDocument(corpus_actual).then(function(doc_actual) {

		corpus = corpus_actual
		documento = doc_actual

		//console.log("corpus", corpus)
		//console.log("Documento", documento)

	}).catch(printError)
}).catch(printError)



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
		//track: 'terremoto ecuador,temblor ecuador,odebrech ecuador',
		locations : "-80.189855,-3.309067,-77.645968,0.446412", //Ecuador Bounding box
		follow: users()
	} 

	var stream = client.stream('statuses/filter', stream_data)

	stream.on('data', function(tweet) {

		var pt = processTweet(tweet)

		if (docID() === documento.identificador && isToday(corpus.fecha)) {

			saveTweet(pt, documento).then(function (tweet) {
				console.log(tweet)

			}).catch(printError)

		} else {

			getCorpus().then(function (corpus_actual){
				getDocument(corpus_actual).then(function(doc_actual) {

					corpus = corpus_actual
					documento = doc_actual

					saveTweet(pt, documento).then(function (tweet) {
						console.log(tweet)

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

/*var stream_data = {
	track: "odebrech,rafael correa,jorge glass,coima,peculado,petroecuador",
	geocode : "-1.304115,-78.754185,200km"
} 

io.on('connection', function (socket) {

	
	setInterval(function() {
		socket.emit('tweet', {usuario: "@23423423", tweet: new Date() + "Hola mundo bla bla bla bla bla"})
	}, 2000)
	
	var stream = client.stream('statuses/filter', stream_data)

	stream.on('data', function(tweet) {
		socket.emit('tweet', processTweet(tweet, stopwords))
	})

	stream.on('error', function(error) {
		console.log("error", error)
	})

	/*socket.on('my other event', function (data) {
		console.log(data);
	})
})*/


function getTrack(array){
	var string = array[0]

	for (var i = 1; i < array.length; i++) {
		string = `${string}, ${array[i]}`
	}

	return string
}

function docID () {
	var date_id = new Date()
	var secs = date_id.getUTCSeconds() + (60 * date_id.getUTCMinutes()) + (60 * 60 * date_id.getUTCHours());
	return Math.floor(secs/1800)
}

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
			return resolve(tweet)

		})
		.catch(function (error) {
			return reject(error)
		})
	})
}

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
					fecha: new Date()
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
	var today = new Date()
	var start = today.setHours(0,0,0,0)
	var end = today.setHours(23,59,59,999)

	if (date >= start && date <= end) 
		return true
	
	return false
}

function printError(error) {
	console.log("Error", error)
}


module.exports = router;
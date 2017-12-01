var router = require('express').Router()
var Twitter = require('twitter');
var { tokens } = require('../config.js')
var { dbTweet } = require("../util/process.js")
var { topicos, users } = require('../DB/topicos.js')
//var stopwords = require('../DB/stopwords.json')
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

app.listen(3001)

router.get("/tweets/prueba", function(req, res, next) {

	var data = JSON.parse( fs.readFileSync(`${__dirname}/../DB/tweets/prueba.json`, 'utf8') )

	return res.json(data)
})



streamTweets()
/*for ( topico of topicos) {
	streamTweets(topico.nombre, getTrack(topico.data))
}*/

function streamTweets(topico = null, track = null) {

	var stream_data = {
		//track: 'terremoto ecuador,temblor ecuador,odebrech ecuador',
		locations : "-80.189855,-3.309067,-77.645968,0.446412", //Ecuador Bounding box
		follow: users()
	} 

	var stream = client.stream('statuses/filter', stream_data)

	stream.on('data', function(tweet) {
		var pt = processTweet(tweet)

		console.log(`Tweet topico ${topico}`, pt)
		dbTweet( __dirname + "/../DB/tweets/prueba.json", pt)
		//socket.emit('tweet', processTweet(tweet, stopwords))
	})

	stream.on('error', function(error) {
		console.log(`\n\nError... ${error}`)
	})
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




module.exports = router;
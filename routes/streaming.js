var router = require('express').Router()
var Twitter = require('twitter');
var config = require('../config.json')
var stopwords = require('../DB/stopwords.json')
var client = new Twitter(config)

const { processTweet } = require('../util/process.js')

var app = require('http').createServer()
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3001);

var stream_data = {
	track: "odebrech,rafael correa,jorge glass,coima,peculado,petroecuador",
	geocode : "-1.304115,-78.754185,200km"
} 

io.on('connection', function (socket) {

	setInterval(function() {
		socket.emit('tweet', {usuario: "@23423423", tweet: new Date() + "Hola mundo bla bla bla bla bla"})
	}, 2000)
	
	/*var stream = client.stream('statuses/filter', stream_data)

	stream.on('data', function(tweet) {
		socket.emit('tweet', processTweet(tweet, stopwords))
	})

	stream.on('error', function(error) {
		console.log("error", error)
	})*/
	/*socket.on('my other event', function (data) {
		console.log(data);
	})*/
})


module.exports = router;
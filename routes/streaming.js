var router = require('express').Router()
var Twitter = require('twitter');
var config = require('../config.json')
var stopwords = require('../DB/stopwords.json')
var client = new Twitter(config)

const { processTweet } = require('../util/process.js')

var stream_data = {
	track: "odebrech,rafael correa,jorge glass,coima,peculado,petroecuador",
	geocode : "-1.304115,-78.754185,200km"
} 

client.stream('statuses/filter', stream_data, function(stream) {

	stream.on('data', function(tweet) {
		console.log(processTweet(tweet, stopwords))
	})

	stream.on('error', function(error) {
		console.log("error", error)
	})
})	


module.exports = router;
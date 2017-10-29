var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var config = require('../config.json')

var client = new Twitter({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token_key: config.access_token_key,
	access_token_secret: config.access_token_secret
})

/* GET home page. */
router.get("/:buscar", function(req, res, next) {

	var parameters = {
		lang : "es", 
		count : 100 ,
		q : req.params.buscar,
		result_type : "recent",
		geocode : "-1.304115,-78.754185,200km"
	}

	client.get('search/tweets', parameters, function(error, tweets, response) {

		if (error) {
			console.log(error)
			throw Error (error)
		}

		var data = []
		var data_string = []

		for (var tweet of tweets.statuses) {
			delete tweet.metadata
			delete tweet.source
			delete tweet.entities

			//data.push(tweet)
			//data_string.push(tweet.text)
			data_string.push({
				tweet : tweet.text,
				usuario : "@" + tweet.user.screen_name,
				nombre : tweet.user.name 
			})
		}

		console.log("# de tweets", data.length)

	   	res.json(data_string)
	})
})

module.exports = router;

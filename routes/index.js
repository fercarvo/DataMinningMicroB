var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser');

module.exports = router;

var Twitter = require('twitter');
var config = require('../config.json')
var stopwords = require('../DB/stopwords.json')
var snowball = require('node-snowball')
 
var client = new Twitter(config)


router.get("/:buscar", function(req, res, next) {

	var parameters = {
		lang : "es", 
		count : req.query.count,
		q : req.params.buscar,
		result_type : "recent",
		geocode : "-1.304115,-78.754185,200km"
	}

	client.get("search/tweets", parameters)
		.then(function(tweets, response) {

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

			fs.writeFileSync('DB/storage.json', JSON.stringify(data_string), 'utf8')

			return res.json(data_string)

		})
		.catch(function (error){
			return next(error)
		})
})

router.get("/cache/1", function(req, res, next) {

	var data = JSON.parse(fs.readFileSync('DB/storage.json', 'utf8'))

	return res.json(data)
})

router.get("/prueba/1", function(req, res, next) {
	 
	var resultado = snowball.stemword(['cantamos', 'cantaremos', ''], 'spanish')
	console.log(resultado)
	return res.json(stopwords)
	//return res.send('El json esta mal');
})



function cleanWord(word) {
	if (true){}
}

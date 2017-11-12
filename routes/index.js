var router = require('express').Router()
var fs = require('fs')

module.exports = router

const { 
	processTweet, 
	cleaner, 
	storageTweets, 
	stopwords } = require('../util/process.js')


var Twitter = require('twitter');
var config = require('../config.json')
var client = new Twitter(config)

router.get("/query/:buscar", function(req, res, next) {

	var parameters = {
		lang : "es", 
		count : 100,
		q : req.params.buscar,
		result_type : "recent",
		geocode : "-1.304115,-78.754185,200km"
	}

	console.log("cargando...")

	client.get("search/tweets", parameters)
		.then(function(tweets, response) {
			console.log("procesando...")
			var data = []

			for (var tweet of tweets.statuses) {
				var clean_data = cleaner(tweet.text, stopwords)

				data.push({
					id : tweet.id,
					tweet : tweet.text,
					clean_data : clean_data,
					usuario : "@" + tweet.user.screen_name,
					nombre : tweet.user.name 
				})
			}

			storageTweets('DB/storage.json', data) //Se almacenan los nuevos tweets en la BD

			return res.json(data)

		})
		.catch(function (error){
			return next(error)
		})
})

router.get("/database", function(req, res, next) {
	var data = JSON.parse(fs.readFileSync('DB/storage.json', 'utf8'))

	return res.json({data: data, length: data.length})
})


router.get("/count", function(req, res, next) {
	var tweets = JSON.parse(fs.readFileSync('DB/storage.json', 'utf8'))
	var words = []
	var counter = {}

	for (tweet of tweets) { //Se concatenan todos los array de palabras de cada twwet
		words = words.concat(tweet.clean_data)
	}

	for (word of words) { //Cuento las veces que se repite cada palabra en el documento
		if (counter[word]){
			counter[word]++
		} else {
			counter[word] = 1
		}
	}

	for (var property in counter) { //Se eliminan las palabras que se repiten menos de 5 veces
	    if (counter[property] <= 100)
	    	delete counter[property]
	}

	return res.json(counter)
})


router.get("", function(req, res, next){
	res.render('index')
})




router.get("/streaming", function (req, res, next){
	var stream_data = {
		track: "odebrech,rafael correa,jorge glass,coima,peculado,petroecuador",
		geocode : "-1.304115,-78.754185,200km"
	} 

	/*client.stream('statuses/filter', stream_data, function(stream) {

		stream.on('data', function(tweet) {
			console.log(processTweet(tweet, stopwords))
		})

		stream.on('error', function(error) {
			console.log("error", error)
		})
	})*/
	return res.send("No implementado...")	
})


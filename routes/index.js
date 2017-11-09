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
	var prueba = " Odebrech odebrech Jorge Glass perro, gato, garabato, perro perro ////////perro uno Actualmente, actualmente ademas ademas ademas, aDeMas dos tres https://gogole.com asdasdasd qwea dasdq wdqwdqw dqwd"
	
	/*prueba = prueba.toLowerCase(); //todo a minusculas
	prueba = prueba.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //Se elimina URLs
	array = prueba.match(/\b(\w+)\b/g) //Se convierte string a array de palabras

	for (word of stopwords) { //Se elimina stopwords
		var i = array.length
		while (i--) {
		    if (array[i] == word)
		    	array.splice(i, 1)
		}
	}

	array = snowball.stemword(array, 'spanish') //Se realiza el stemming*/

	var resultado = cleaner(prueba, stopwords)

	return res.json({string: prueba, resultado: resultado})
})


/*
	Funcion que recibe un string y devuelve un array de palabras limpias
*/
function cleaner(string, stopwords) {
	string = string.toLowerCase(); //todo a minusculas
	string = string.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //Se elimina URLs
	array = string.match(/\b(\w+)\b/g) //Se convierte string a array de palabras

	for (word of stopwords) { //Se elimina stopwords
		var i = array.length
		while (i--) {
		    if (array[i] == word)
		    	array.splice(i, 1)
		}
	}

	array = snowball.stemword(array, 'spanish') //Se realiza el stemming
	return array
}

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
	client.get('search/tweets', {count: 20 ,q: req.params.buscar}, function(error, tweets, response) {
		var palabra = "ESPOL tuvo un dia muy duro, asdasdasd, asdasdasdd, RT, cancion canté cataremos cantamos"
		var separators = [' ', ',', '.'];
		var tokens = palabra.split(new RegExp(separators.join('|'), 'g'));
		console.log(tokens)
	   	res.send(tweets)
	});
	//res.render('index', { title: 'Express' })






})

module.exports = router;

var router = require('express').Router()
var fs = require('fs')
var body = require('body-parser');

module.exports = router;

var Twitter = require('twitter');
var config = require('../config.json')
var stopwords = require('../DB/stopwords.json')
var snowball = require('node-snowball')
const { fork } = require('child_process')
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

router.get("", function(req, res, next) {
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


function processTweet(tweet, stopwords) {
	var clean_tweet = cleaner(tweet.text, stopwords)

	return {
		id : tweet.id,
		tweet : tweet.text,
		clean_data : clean_tweet,
		usuario : "@" + tweet.user.screen_name,
		nombre : tweet.user.name 
	}
}


/*
	Funcion que recibe un string y devuelve un array de palabras limpias
*/
function cleaner(string, stopwords) {

	if (!string || !stopwords)
		throw new Error("No existe el string o los stopwords")

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

/*
	Funcion que recibe nuevos tweets y los almacena en un archivo con los demas
*/
function storageTweets (path, new_tweets) {
	var DB_tweets

	fs.readFile(path, 'utf8', function(error, data_string){
		if (error) {
			console.log("Error al leer tweets de la BD", error)
		} else {
			DB_tweets = JSON.parse(data_string)

			for (DB_tweet of DB_tweets) {
				var i = new_tweets.length
				while (i--) {
				    if (new_tweets[i].id == DB_tweet.id)
				    	new_tweets.splice(i, 1)
				}
			}

			var new_DB = DB_tweets.concat(new_tweets)

			fs.writeFile('DB/storage.json', JSON.stringify(new_DB), 'utf8', function (error){
				if (error)
					return console.log("No se ha podido guardar los tweet", error)

				console.log("Se guardo en la BD")
			})

		}
	})
}

function longCompute2(text) {
	var sum = 1
	var cantidad = 100000
	for (var i = 0; i < cantidad; i++) {
		sum+=1
		console.log(sum + text)
	}

	return sum
}

/*
	Función que ejecuta un proceso con la sintaxis de promises
*/
function processPromise (path, data) {
	return new Promise(function(resolve, reject){
		var child = fork(path)

		child.send(data)

		child.on("message", function (result){
			resolve(result)
			child.kill()
		})
	})
}

//Performance test multi hilo
router.get("/test0", function(req, res, next) {

	var begin = Date.now()

	var proc = []

	proc.push( processPromise('./routes/process1.js', " 1") )
	proc.push( processPromise('./routes/process1.js', " 2") )
	proc.push( processPromise('./routes/process1.js', " 3") )
	proc.push( processPromise('./routes/process1.js', " 4") )

	
	Promise.all(proc).then(function (){
		res.send("Performance time: " + (Date.now() - begin)/1000 + "s")
	})
})


//Performance test 1 hilo
router.get("/test1", function(req, res, next) {

	var begin = Date.now()

	longCompute2(" 1")
	longCompute2(" 2")
	longCompute2(" 3")
	longCompute2(" 4")

	return res.send("Performance time: " + (Date.now() - begin)/1000 + "s")

})


router.get("/index", function(req, res, next){
	res.render('index')
})




router.get("/streaming", function (req, res, next){
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
})


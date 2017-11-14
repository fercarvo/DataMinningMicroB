var stopwords = require('../DB/stopwords.json')
var snowball = require('node-snowball')
var fs = require('fs')
const { fork } = require('child_process')
var nj = require('numjs')


module.exports = {
	processTweet: processTweet,
	cleaner: cleaner,
	storageTweets: storageTweets,
	stopwords: stopwords,
	longCompute: longCompute,
	processPromise: processPromise
}

/*
	Funcion que procesa un tweet y lo devuelve limpio
*/
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

/*
	Simulador de procesamiento de CPU
*/
function longCompute(text) {
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


/*
	Funcion tr, recibe 2 matrices de la misma longitud y devuelve la otra con la multiplicacion
	de sus terminos
*/
function tr(A, B) {
	A = A.tolist()
	B = B.tolist()

	var suma = 0
	var multiplicacion;

	for (var fila = 0; fila < A.length; fila++) {
		for (var columna = 0; columna < A[0].length; columna++) {
			multiplicacion = A[fila][columna] * B[fila][columna] //Se guarda la multiplicacion para ir sumando
			A[fila][columna] = multiplicacion
			suma += multiplicacion		
		}
	}

	return nj.array(A)
}


/*
	Algoritmo JPP que recibe matrices
*/
function JPP (X, R){
	var k = 6 //valor dado en el paper
	var n = b.shape[0] // # filas X
	var v1 = b.shape[1] // # columnas X
	var W = nj.random([n,k]) //Matriz aleatoria de n x k
	var H = nj.random([k,v1]) //Matriz aleatoria de k x v1
	var M = nj.random([k,k]) //Matriz aleatoria de k x k
}
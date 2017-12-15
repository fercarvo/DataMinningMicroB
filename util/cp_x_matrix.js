var natural = require('natural')
var TfIdf = natural.TfIdf
var nj = require('numjs')
const { cleaner } = require("../util/process.js")

process.on('message', function (documentos) {

	console.log("Dentro del childprocess")

	var corpus = new TfIdf()

	var palabras_corpus = [] //Todas las palabras del corpus concatenadas doc_1.concat(doc_2)
	var matrix_X = []

	//Se procesa cada tweet, steaming, etc..
	var num_docs = documentos.length

	for (doc of documentos) {
		console.time("dentro for docs")

		doc.words = [] //Todas las palabras de un documento
		doc.cadena = "" //Todas las palabras del doc separadas por un espacio

		for (tweet of doc.tweets) {
			//console.log("asdasda", tweet.tweet)
			tweet.clean_data = cleaner(tweet.tweet)
			doc.words = doc.words.concat(tweet.clean_data) //Se concatenan todos los clean data en doc.words
			doc.cadena += doc.words.join(' ') //Se unen todas las palabras en un solo string 
		}

		corpus.addDocument(doc.cadena)

		palabras_corpus = palabras_corpus.concat(doc.words) //Se concatenan todas las palabras de todos los docs
		console.log(`quedan ${--num_docs}`)
		console.timeEnd("dentro for docs")				
	}

	palabras_corpus = contador(palabras_corpus)

	for (palabra of palabras_corpus) {
		var fila = []

		corpus.tfidfs(palabra, (i, resultado) => {
			fila.push(resultado)
		})

		matrix_X.push(fila)
	}

	matrix_X = nj.array(matrix_X)
	matrix_X = matrix_X.T
	matrix_X = matrix_X.tolist()

	var data_to_send = {matrix_X, palabras_corpus}

	process.send(data_to_send)
}) 

//Recibe array de string, devuelve dicccionario de cada palabra con su contador
function contador (words){
	var counter = {}
	var palabras = []

	for (word of words) { //Cuento las veces que se repite cada palabra en el documento
		if (isNaN(word)) { //No cuenta los numeros
			
			if (counter[word])
				counter[word]++
			else
				counter[word] = 1			
		}

	}

	for (palabra in counter)
		palabras.push(palabra)		

	return palabras
}
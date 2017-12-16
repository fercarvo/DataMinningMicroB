var natural = require('natural')
var TfIdf = natural.TfIdf
var nj = require('numjs')
const { cleaner } = require("../util/process.js")

process.on('message', function (documentos) {

	var corpus = new TfIdf()

	var palabras_corpus = [] //Todas las palabras del corpus concatenadas doc_1.concat(doc_2)
	var matrix_X = []

	//Se procesa cada tweet, steaming, etc..
	var num_docs = documentos.length

	for (doc of documentos) {
		console.time("dentro for docs")

		doc.words = [] //Todas las palabras de un documento

		for (tweet of doc.tweets) {
			tweet.clean_data = cleaner(tweet.tweet)
			doc.words = doc.words.concat(tweet.clean_data) //Se concatenan todos los clean data en doc.words
		}

		doc.cadena = doc.words.join(" ")

		corpus.addDocument(doc.cadena)

		palabras_corpus = palabras_corpus.concat(doc.words) //Se concatenan todas las palabras de todos los docs
		console.log(`quedan ${--num_docs}`)
		console.timeEnd("dentro for docs")				
	}

	palabras_corpus = contador(palabras_corpus)
	console.time("tf")
	for (palabra of palabras_corpus) {
		var fila = []

		corpus.tfidfs(palabra, (i, resultado) => {
			fila.push(resultado)
		})

		matrix_X.push(fila)
	}
	console.timeEnd("tf")

	matrix_X = nj.array(matrix_X)
	matrix_X = matrix_X.T
	matrix_X = matrix_X.tolist()

	var data_to_send = {X: matrix_X, palabras: palabras_corpus}

	process.send(data_to_send)
}) 

//Recibe array de string, devuelve dicccionario de cada palabra con su contador
function contador (words){
	var counter = {}
	var palabras = []

	for (word of words) { //Cuento las veces que se repite cada palabra en el documento
		if (!counter[word]) { //Si no existe
			if (isNaN(word)){ //Si es letras
				counter[word] = 1
				palabras.push(word) 
			}
		}
	}	

	return palabras
}
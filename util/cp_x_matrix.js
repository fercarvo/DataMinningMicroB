var nj = require('numjs')
const { cleaner, eachSeries } = require("../util/process.js")

process.on('message', function (documentos) {

	var palabras_corpus = [] //Todas las palabras del corpus concatenadas doc_1.concat(doc_2)
	var corpus = []
	var X = []

	//Se procesa cada tweet, steaming, etc..
	for (doc of documentos) {
		doc.words = [] //Todas las palabras de un documento

		for (tweet of doc.tweets) {
			tweet.clean_data = cleaner(tweet.tweet)
			doc.words = doc.words.concat(tweet.clean_data) //Se concatenan todos los clean data en doc.words
		}

		corpus.push(doc.words)

		palabras_corpus = palabras_corpus.concat(doc.words) //Se concatenan todas las palabras de todos los docs
	}

	palabras_corpus = contador(palabras_corpus)

	var cont_pa = palabras_corpus.length

	for (palabra of palabras_corpus) //Por cada palabra se ejecuta el tfidf y se retorna un Array[]
		X.push( tf_idf(corpus, palabra) )

	X = nj.array(X)
	X = X.T //La resultante es TERMINO x DOCUMENTO, por eso se traspone
	X = X.tolist()

	var data_to_send = {X: X, palabras: palabras_corpus}

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

function tf_idf (corpus, word) {

	var tf = (document, word)=> {
		var td = document.filter((value)=> value===word).length
		return Math.log10(1 + td)
	}

	var idf = (corpus, word)=> {
		nt = 1
		for (doc of corpus) {
			if (doc.indexOf(word) > -1)
				nt++
		}
		return Math.log10(1 + ( corpus.length / nt ) )
	}

	var result = [] //palabra por cada documento
	var idf = idf(corpus, word)

	for (doc of corpus)
		result.push( (tf(doc, word)*idf) + 0.000000001 )

	return result
}

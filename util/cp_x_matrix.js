var { array } = require('numjs')
const { cleaner } = require("../util/process.js")


process.on('message', function (documentos) {
	var corpus = [] // [Map] new Map("word", frecuency)
	var X = []
	var setPalabras = new Set() //Palabras sin repetir del corpus

	for (doc of documentos) {

		let docWords = doc.tweets.reduce((words, t) => [...words, ...cleaner(t.tweet) ], []) //Todas las palabras del doc
		
		let map = docWords.reduce((map, w)=> { 
			let cont = map.get(w) 
			if (++cont)
				map.set(w, cont)
			else
				map.set(w, 1)

			return map
		}, new Map())

		map.forEach((value, key) => setPalabras.add(key))
		corpus = [...corpus, map]
	}

	setPalabras.forEach(palabra => X.push( tf_idf(corpus, palabra) ))

	X = array(X).T.tolist()
	process.send({X: X, palabras: [...setPalabras]})
})

// corpus = [{word: frecuency}]
function tf_idf (corpus, word) {

	function tf (doc, word) { 
		return Math.log(1 + (doc.get(word) || 0) ) 
	}

	function idf (corpus, word) {
		var nt = corpus.reduce((nt, doc)=> doc.has(word) ? ++nt : nt ,1)
		return Math.log(1 + (corpus.length / nt))
	} 

	var idf = idf(corpus, word)

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}
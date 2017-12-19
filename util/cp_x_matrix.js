var { array } = require('numjs')
const { cleaner } = require("../util/process.js")


process.on('message', function (documentos) {

	var corpus = [] // [Map] new Map("word", frecuency)
	var X = []
	var setPalabras = new Set() //Palabras sin repetir del corpus

	for (doc of documentos) {

		let docWords = doc.tweets.reduce((words, t) => [...words, ...cleaner(t.tweet) ], []) //Todas las palabras del doc
		let map = docWords.reduce((map, word)=> { map[word] ? map[word]++ : map[word]=1 ; return map }, {}) //dic contador
		Object.keys(map).forEach(word => setPalabras.add(word)) //Se agregar palabras del doc al set global
		corpus = [...corpus, map]
	}

	setPalabras = [...setPalabras].sort()

	setPalabras.forEach(palabra => X.push( tf_idf(corpus, palabra) ))

	X = array(X).T.tolist()

	process.send({X: X, palabras: [...setPalabras]})
		
})

// corpus = [{word: frecuency}]
function tf_idf (corpus, word) {

	var tf = (doc, word) => Math.log(1 + (doc[word] || 0) )

	var idf = (corpus, word) => {
		var nt = corpus.reduce((nt, doc)=> doc[word] ? ++nt : nt ,1)
		return Math.log(1 + (corpus.length / nt))
	} 

	var idf_calc = idf(corpus, word)

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf_calc], [])
}
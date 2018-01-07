const { cleaner } = require("../util/process.js")


process.on('message', function (documentos) {
	var corpus = [] // [Map] new Map("word", frecuency)
	var setPalabras = new Set() //Palabras sin repetir del corpus

	for (doc of documentos) {

		let map = {}
		
		let docWords = doc.tweets.reduce((words, t) => [...words, ...cleaner(t.tweet) ], []) //Todas las palabras del doc
		
		for (w of docWords) {
			if (map[w])
				map[w]++
			else
				map[w] = 1
		}

		for (key in map)
			setPalabras.add(key)
		
		corpus.push(map)
	}

	setPalabras = [...setPalabras]

	process.send({setPalabras, corpus})
		
})
const { cleaner } = require("../util/process.js")

process.on('message', function (documentos) {
	var corpus = [] // [Map] new Map("word", frecuency)
	var setPalabras = new Set() //Palabras sin repetir del corpus

	documentos.forEach(doc => {
		var map = {}
		var docWords = doc.tweets.reduce((words, t) => [...words, ...cleaner(t) ], []) //Todas las palabras del doc

		docWords.forEach(word => {
			if (word in map)
				map[word]++
			else
				map[word] = 1
		})

		for (var key in map)
			setPalabras.add(key);

		corpus.push(map)
	})
	setPalabras = [...setPalabras]
	process.send({setPalabras, corpus})		
})
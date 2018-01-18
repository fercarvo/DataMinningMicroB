
//data= {corpus, palabra}, i
process.on('message', function (data) {
	var X = data.setPalabras.reduce((arr, word) => [...arr, tf_idf2(data.corpus, word)], [])
	process.send(X)

})

process.on('uncaughtException', function (err) {
    console.log("err", err)
    process.send({error: err})
})


// corpus = [{word: frecuency}]
function tf_idf (corpus, word) {

	function tf (doc, word) { 
		return Math.log(1 + (doc[word]|| 0) ) 
	}

	function idf (corpus, word) {
		var nt = corpus.reduce((nt, doc)=> doc[word] ? ++nt : nt ,1)
		return Math.log(1 + (corpus.length / nt))
	} 

	var idf = idf(corpus, word)

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}

function tf_idf2 (corpus, word) {
	function tf (doc, word) {
		let frecuency = doc[word] ? doc[word] : 0;
		let max_frec = Object.keys(doc).reduce((max, next) => doc[max] > doc[next] ? max : next)

		return 0.5 + ((0.5*frecuency)/max_frec) 
	}

	var nt = corpus.reduce((nt, doc)=> doc[word] ? ++nt : nt ,1)
	var idf = Math.log10(1 + (corpus.length / nt))

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}
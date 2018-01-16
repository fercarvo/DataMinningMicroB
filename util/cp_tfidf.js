
//data= {corpus, palabra}, i
process.on('message', function (data) {
	
	var X = data.setPalabras.reduce((arr, word) => [...arr, tf_idf(data.corpus, word)], [])
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

// corpus = [{word: frecuency}]
function tf_idf2 (corpus, word) {

	function tf (doc, word) {
		var max_word = Object.keys(doc).reduce((word, next) => doc[word] > doc[next] ? word : next);
		return 0.5 + ((0.5*doc[word])/max_word) 
	}

	function idf (corpus, word) {
		var nt = corpus.reduce((nt, doc)=> doc[word] ? ++nt : nt ,1)
		return Math.log10(1 + (corpus.length / nt))
	} 

	var idf = idf(corpus, word)

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}

// TF double normalization 0.5, IDF probabilistic
function tf_idf3 (corpus, word) {
	var nt = corpus.reduce((nt, doc)=> (word in doc) ? ++nt : nt ,1)

	function tf (doc, word) {
		var max_word = Object.keys(doc).reduce((word, next) => doc[word] > doc[next] ? word : next);
		return ( 0.5 + ((0.5*doc[word])/max_word) )
	}

	function idf (corpus, word) {
		return Math.log10((corpus.length - nt)/nt)
	} 

	var idf = idf(corpus, word)

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}
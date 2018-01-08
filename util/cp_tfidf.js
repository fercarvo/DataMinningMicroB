
//data= {corpus, palabra}, i
process.on('message', function (data) {

	var X = [] 

	for (palabra of data.setPalabras)
		X = [...X, tf_idf(data.corpus, palabra) ]

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
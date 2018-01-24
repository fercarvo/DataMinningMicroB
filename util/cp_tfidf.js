
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
	var tf = (doc, word) => Math.log(1 + (doc.map[word]|| 0) )
	var nt = corpus.reduce((nt, doc)=> doc.map[word] ? ++nt : nt ,1)
	var idf = Math.log(1 + (corpus.length / nt))

	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}

function tf_idf2 (corpus, word) {
	var tf = (doc, word) => 0.5 + ((0.5*(doc.map[word] ? doc.map[word] : 0))/doc.values);
	var nt = corpus.reduce((nt, doc)=> doc.map[word] ? ++nt : nt ,1)
	var idf = Math.log(1 + (corpus.length / nt))
	return corpus.reduce((xT, doc) => [...xT, tf(doc, word)*idf], [])
}
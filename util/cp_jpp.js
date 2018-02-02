var nj = require('numjs')
const { JPP, processPromise, cleanM } = require('../util/process.js')

process.on('message', async function (d) {
	var k = d.k
	var alpha = 0.1
    var lambda = d.lambda
    var epsilon = 0.01
    var maxiter = 100

    var setPalabras = new Set([...d.data_1.setPalabras, ...d.data_2.setPalabras])

    var id = Math.round( Math.random() * 1000)/1000 
	
	var X_1 = []
	var X_2 = []

	console.time(id + " tfidf")

	setPalabras = [...setPalabras]
	console.log('Num setPalabras', setPalabras.length)

	var p1 = processPromise(`${__dirname}/cp_tfidf.js`, {setPalabras, corpus: d.data_1.corpus})
	var p2 = processPromise(`${__dirname}/cp_tfidf.js`, {setPalabras, corpus: d.data_2.corpus})

	try {
		var X = await Promise.all([p1, p2])

		console.timeEnd(id + " tfidf")
		X_1 = nj.array( cleanM( X[0] )).T
		X_2 = nj.array( cleanM( X[1] )).T

		var r_1 = nj.random([k, X_1.shape[1]]).tolist()

		X_1 = X_1.tolist()
		X_2 = X_2.tolist()	

		console.time(id + " jpp")

		var jpp_1 = JPP(X_1, r_1, k, alpha, lambda, epsilon, maxiter)
		console.log('\n\n\n')
		var jpp_2 = JPP(X_2, jpp_1.H, k, alpha, lambda, epsilon, maxiter)

		console.timeEnd(id + " jpp")

		console.time(id + " topicos")

		//var topicos_1 = extraerTopicos(jpp_1.H, setPalabras) //10 palabras
		//var topicos_2 = extraerTopicos(jpp_2.H, setPalabras)
		var topicos_1 = extraerDocTopicos(jpp_1.W, d.data_1.corpus)
		var topicos_2 = extraerDocTopicos(jpp_2.W, d.data_2.corpus)

		console.timeEnd(id + " topicos")
		process.send({M: jpp_2.M, topicos_1, topicos_2})

	} catch (e) {
		console.log(e)
		process.send({error: e.message})
	}
})


function findIndicesOfMax(arr, count) {
	var new_arr = arr.map((val, index)=> { return {val, index} })
	new_arr.sort((a,b)=> b.val-a.val)
	return new_arr.slice(0, count).map(it => it.index)
}

//Extrae los terminos con mayor tfidf de cada tópico
function extraerTopicos (H, setPalabras) { //de H
	return H.map(function (topico){
		topico = topico.map((val, i) => {return {val, word: setPalabras[i]} })
		topico.sort((a, b) => b.val - a.val)
		return topico.slice(0, 10).map(item => item.word)
	})
}

//De cada tópico, elige los 10 mejores documentos y extrae sus palabras con mayor frecuencia.
function extraerDocTopicos (W, corpus) {
	var to_doc = nj.array(W).T.tolist() //Topico x Doc
	to_doc = to_doc.map(t => findIndicesOfMax(t, 10)) //n mejores documentos

	return to_doc.map(topico => {
		topico = topico.map(index_doc => corpus[index_doc].map)
		topico = topico.map(doc => {
			doc = Object.entries(doc).sort((a, b)=> b[1]-a[1]) //[ ['perro', 233], ['gato', 9] ]
			return doc.slice(0, 7).map(obj => obj[0]) //['perro', 'gato', 'caballo']
		})
		topico = topico.reduce((arr, doc_arr)=> [...arr, ...doc_arr], [])
		return [...new Set(topico)].slice(0, 7)
	})
}
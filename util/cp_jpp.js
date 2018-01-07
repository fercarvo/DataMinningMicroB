var nj = require('numjs')
const { JPP } = require('../util/process.js')

//d = {data_1, data_2, k}
//retorna = {jpp_1, jpp_2, topicos_1, topicos_2}

process.on('message', function (d) {
	var k = d.k
	var alpha = 10000000
    var lambda = 0.05
    var epsilon = 0.01
    var maxiter = 100

    var setPalabras = [...d.data_1.setPalabras, ...d.data_2.setPalabras]
	setPalabras = [...new Set(setPalabras)]
	
	var X_1 = []
	var X_2 = []

	for (palabra of setPalabras) {
		X_1.push( tf_idf(d.data_1.corpus, palabra) )
		X_2.push( tf_idf(d.data_2.corpus, palabra) )
	}

	X_1 = nj.array(X_1).T
	X_2 = nj.array(X_2).T
	
	var r_1 = nj.random([k, X_1.shape[1]])

	X_1 = X_1.tolist()
	X_2 = X_2.tolist()	

	var jpp_1 = JPP(X_1, r_1, k, alpha, lambda, epsilon, maxiter)
	var jpp_2 = JPP(X_2, jpp_1.H, k, alpha, lambda, epsilon, maxiter)

	var topicos_1 = extraerTopicos(jpp_1.H, setPalabras)
	var topicos_2 = extraerTopicos(jpp_2.H, setPalabras)	

	process.send({M: jpp_2.M, topicos_1, topicos_2})		
})


function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort((a, b) => inp[b] - inp[a]) // descending sort the output array
            outp.pop() // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

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

function extraerTopicos (h, setPalabras) {
	var topicos = []

    for (var i = 0; i < h.length; i++)
        topicos.push({indice: i+1, maximos: findIndicesOfMax(h[i], 7)})
    
    for (topico of topicos)
        topico.maximos = topico.maximos.map(i => setPalabras[i]).sort()

    return topicos
}
const router = require('express').Router()
const nj = require('numjs')
const mongoose = require("mongoose")
const moment = require("moment")
const cores = require('os').cpus().length

const { getJPP, getCorpus, getXprocess, getDocuments } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel, processPromise } = require('../util/process.js')

var io = require('socket.io')( require('http').createServer().listen(3001) )

const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')

var corpus_cache = [] //Se calculan al inicio los corpus con su matriz X y palabras
var en_proceso = []

var calculo_jpp = new Map()

console.time("procesamiento corpus")
getCorpus()
	.then(data => { corpus_cache = data, console.timeEnd("procesamiento corpus") })
	.catch(e => console.log(e))


//Se obtienen todos los corpus recopilados
router.get("/corpus", function (req, res, next){

	Corpus.find({}, "fecha").exec()
		.then(docs => res.json(docs))
		.catch(error => next(error))

})


//Se obtienen todos los documentos de un corpus
router.get("/corpus/:id/documentos", function (req, res, next){

/*	getDocuments(req.params.id)
		.then(data => {
			var documentos = data.map(doc => {
				return {
					_id : doc._id,
					identificador: doc.identificador, 
					tweets: doc.tweets.reduce((tweets, tweet)=> [...tweets, tweet.tweet] ,[])
				}
			})

			res.json(documentos)
		})
		.catch(e => next(e))
*/
	Document.find({_corpus: req.params.id})
	.exec()
		.then(docs => {
			docs = docs.map(d => d.toObject())
			docs.forEach(d => {d.tweets=d.tweets.length})
			res.json(docs)
		})
		.catch(error => next(error))
})


io.on('connection', function (socket) {

	socket.on('jpp', function (req) {
		console.log("Key:", req.peticion)
		var cache = calculo_jpp.get(req.peticion)

		if (cache) //Si ya esta procesado, se devuelve
			return io.emit("jpp", {peticion: req.peticion, data: cache})

		if (en_proceso.indexOf(req.peticion) > -1) //Si se esta procesando, se rechaza
			return console.log("encolado...")

		var data_1 = corpus_cache.find(corpus => corpus._id.toString()===req.data.id1.toString())
		var data_2 = corpus_cache.find(corpus => corpus._id.toString()===req.data.id2.toString())
		var k = parseInt(req.data.k) || 6
		var lambda = parseFloat(req.data.lambda) || 0.5 

		if (!data_1 || !data_2)
			return io.emit("jpp", {peticion: req.peticion, error: "Información de X aun no procesadas"})

		en_proceso.push(req.peticion)

		processPromise(`${__dirname}/../util/cp_jpp.js`, {data_1, data_2, k, lambda})
			.then(resultado => {

				calculo_jpp.set(req.peticion, resultado) //Se agrega el resultado al cache

				var index = en_proceso.indexOf(req.peticion)

				if (index > -1)
					en_proceso.splice(index, 1) //Se elimina la peticion de la cola de espera

				return io.emit("jpp", {peticion: req.peticion, data: resultado})

			})
			.catch(e => io.emit("jpp", {peticion: req.peticion, error: e}))
	})
})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/jpp/:id1/:id2/:k/:lambda", function (req, res, next) {

	var key = `${req.params.id1}/${req.params.id2}/${req.params.k}/${req.params.lambda}`;
	var cache = calculo_jpp.get(key)

	if (cache)
		return res.json(cache)

	return next(new Error("Información aun en procesamiento, espere"))
})









/* //Compactador de corpus/documents/tweets
Corpus.findOne({_id: '5a3eee0105020b5fb91ce7e9'}).exec((error, corpus)=> {
	if (error)
		return console.log("error", error);
	
	console.log('corpus', corpus)
	Document.find({_corpus: corpus._id}).exec((error, docs)=> {
		if (error)
			return console.log("Error docs", error);

		eachSeries(docs, function(doc, next, error){

			Tweet.find({_document: doc._id}).exec((error, tweets)=> {
				if (error) {
					console.log("Error encontrar tweets")
					return error(error)
				}
				tweets = tweets.map(t => t.toObject())
				tweets = tweets.reduce((arr, t)=> [...arr, t.tweet], []) //["asdasdasd", "asdasd"]
				doc.tweets = tweets
				doc.save((error, doc)=> {

					if (error) {
						console.log('No se pudo actualizar el doc')
						return error(error)
					}

					console.log('new doc', doc)

					Tweet.remove({_document: doc._id}).exec(e => {
						if (e)
							return error(e)

						console.log('Eliminados tweets de', doc._id)
						Tweet.find({_document: doc._id}).exec((err, tweets)=> {
							if (err)
								return console.log('No se pudo buscar tweets eliminados', err);

							console.log('No deben haber tweets', tweets)
							next()
						})
					})
				})
			})

		}).then(bien => {
			console.log('Se elimino todo tweet y actualizo corpus')
		})
		.catch(e => console.log('Error', e))
	})
})
*/



































module.exports = router;
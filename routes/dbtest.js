const router = require('express').Router()
const mongoose = require("mongoose")

const { getJPP, getDocuments } = require("../util/mongodb_data.js")
const { eachSeries, eachParallel, processPromise } = require('../util/process.js')

var io = require('socket.io')( require('http').createServer().listen(3001) )

const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')

var en_proceso = []
var calculo_jpp = new Map() //Cache del JPP

//Se obtienen todos los corpus recopilados
router.get("/corpus", async function (req, res, next){
	try {
		var docs = await Corpus.find({}, 'fecha compressed').exec()
		docs = docs.map(d=> d.toObject()).sort((d1, d2)=> d1.fecha - d2.fecha)
		res.json(docs)

	} catch (e) { next(e) }
})


//Se obtienen todos los documentos de un corpus
router.get("/corpus/:id", async function (req, res, next){
	try {
		await Corpus.findOne({_id: req.params.id}).exec()
		var docs = await Document.find({_corpus: req.params.id}, 'identificador tweets').exec()
		docs = docs.map(d => d.toObject()).sort((d1, d2)=> d1.identificador-d2.identificador)

		for (var d of docs)
			d.tweets = d.tweets.length;

		res.json(docs)
		
	} catch (e) { next(e) }
})


io.on('connection', function (socket) {
	socket.on('jpp', async function (req) {
		try {
			console.log("Key:", req.peticion)
			var cache = calculo_jpp.get(req.peticion)

			if (cache) //Si ya esta procesado, se devuelve
				return io.emit("jpp", {peticion: req.peticion, data: cache})

			if (en_proceso.indexOf(req.peticion) > -1) //Si se esta procesando, se rechaza
				return console.log("encolado...")

			var cp1 = req.data.id1
			var cp2 = req.data.id2
			var k = parseInt(req.data.k) || 6
			var lambda = parseFloat(req.data.lambda) || 0.5 

			en_proceso.push(req.peticion)

			var resultado = await getJPP(cp1, cp2, k, lambda)
			calculo_jpp.set(req.peticion, resultado) //Se agrega el resultado al cache
			io.emit("jpp", {peticion: req.peticion, data: resultado})

		} catch (error) {
			io.emit("jpp", {peticion: req.peticion, error: 'Error de procesamiento'})
			console.log(error)
		} finally {
			var index = en_proceso.indexOf(req.peticion)
			if (index > -1)
				en_proceso.splice(index, 1) //Se elimina la peticion de la cola de espera
		}
	})
})



//Se obtiene el JPP resultante del corpus seleccionado
router.get("/jpp/:id1/:id2/:k/:lambda", function (req, res, next) {
	var key = `${req.params.id1}/${req.params.id2}/${req.params.k}/${req.params.lambda}`;
	var cache = calculo_jpp.get(key)

	if (cache)
		return res.json(cache)

	throw new Error("Información aun en procesamiento, espere")
})


//depurar('5a6529813ab2006845004c45')
async function depurar (id){
	try {
		var corpus = await Corpus.findOne({_id: id}).exec();

		if (corpus.compressed)
			return console.log('Ya esta comprimido');

		console.log('corpus', corpus)
		var docs = await Document.find({_corpus: corpus._id}).exec();

		for (var doc of docs) {
			var tweets = await Tweet.find({_document: doc._id}).exec()
			tweets = tweets.map(t => t.toObject())
			tweets = tweets.reduce((arr, t)=> [...arr, t.tweet], []) //["asdasdasd", "asdasd"]
			doc.tweets = tweets

			var new_doc = await doc.save()
			console.log('new doc', new_doc)

			await Tweet.remove({_document: doc._id}).exec();
			console.log('Eliminados tweets de', doc._id)
			var find_tweets = await Tweet.find({_document: doc._id}).exec();
			console.log('No deben haber tweets', find_tweets)
		}

		corpus.compressed = true
		var new_corpus = await corpus.save()
		console.log(new_corpus, 'Se elimino todo tweet y actualizo corpus')
	} catch (e) { 
		console.log('Error', e)
	}
}


/*
function depurar (id) {
	Corpus.findOne({_id: id}).exec((error, corpus)=> {
		if (error)
			return console.log("error", error);

		if (corpus.compressed)
			return console.log('Ya esta comprimido')
		
		console.log('corpus', corpus)
		Document.find({_corpus: corpus._id}).exec((e_find_doc, docs)=> {
			if (e_find_doc)
				return console.log("e_find_doc docs", e_find_doc);

			eachSeries(docs, function(doc, next, error){

				Tweet.find({_document: doc._id}).exec((e_find_t, tweets)=> {
					if (e_find_t) {
						console.log("Error encontrar tweets")
						return error(e_find_t)
					}
					tweets = tweets.map(t => t.toObject())
					tweets = tweets.reduce((arr, t)=> [...arr, t.tweet], []) //["asdasdasd", "asdasd"]
					doc.tweets = tweets
					doc.save((e_save_doc, doc)=> {

						if (e_save_doc) {
							console.log('No se pudo actualizar el doc')
							return error(e_save_doc)
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

				corpus.compressed = true
				corpus.save((error, c)=> {
					if (error)
						console.log('No se pudo actualizar el corpus a compressed')

					console.log(c, 'Se elimino todo tweet y actualizo corpus')
				})
			})
			.catch(e => console.log('Error', e))
		})
	})
}
*/

module.exports = router;
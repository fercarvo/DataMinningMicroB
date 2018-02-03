const router = require('express').Router()
const mongoose = require("mongoose")
const fs = require('fs')

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

async function foo() {	
	/*var id = "5a74fb944d3bf819ead0075e"
	var documentos = await Document.find({_corpus: id}).exec()

	for (doc of documentos)
		await Tweet.remove({_document: doc._id});

	await Document.remove({_corpus: id}).exec()
	await Corpus.remove({_id: id})

	console.log("Removido corpus", id)*/

	var arr_corpus = await Corpus.find({compressed: true}, 'fecha compressed').exec();
	arr_corpus = arr_corpus.map(c => c.toObject());

	await allCorpusToFile(arr_corpus);

	for (corpus of arr_corpus)
		console.log(await corpusToFile(corpus._id));
}

foo()
.then(() => console.log("ENd to file"))
.catch(e => console.log("Error foo", e))

function allCorpusToFile(data) {
	return new Promise(resolve => {
		fs.writeFile(`${__dirname}/../DB/corpus.json`, JSON.stringify(data), err => {
			if (err) 
				throw new Error(err);

			resolve();
		})
	})
}


//Guarda un corpus con sus documentos a file.json
async function corpusToFile (c_id) {
	var fileName = `${__dirname}/../DB/corpus/${c_id}.json`;
	try {
		await new Promise((good, error) => { 
			fs.access(fileName, fs.constants.F_OK, err => {
				if (err)
					error();
				else
					good();
			})
		})
		//Si existe el archivo
		return "El corpus ya existe en json"

	} catch (e) {
		try {
			var corpus = await Corpus.findOne({_id: c_id}).exec()

			if (!corpus || !corpus.compressed)
				throw new Error("No existe corpus o no esta comprimido");

			var docs = await Document.find({_corpus: corpus._id}, 'identificador tweets').exec()

			if (docs.length === 0)
				throw new Error("No existe data en el corpus");

			docs = docs.map(d => d.toObject()).sort((d1, d2)=> d1.identificador-d2.identificador)

			var result = await new Promise(resolve => {
				fs.writeFile(fileName, JSON.stringify(docs), err => {
					if (err) 
						throw new Error(err);

					resolve()
				})
			})

			return `File saved ${corpus._id}.json`
		} catch (e) {
			return `Error: ${e}`
		}
	}
}


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

module.exports = router;
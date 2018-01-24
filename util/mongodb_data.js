const mongoose = require("mongoose")
const Tweet = require('../models/Tweet.js')
const Corpus = require('../models/Corpus.js')
const Document = require('../models/Document.js')
const moment = require('moment')
const { eachParallel, processPromise } = require('../util/process.js')

module.exports = { getJPP }

async function getJPP(corpus1, corpus2, k, lambda) {
	console.log('Iniciando proceso de corpus')
	console.time(`X of ${corpus1}/${corpus2}`)
	var c1 = getX(corpus1)
	var c2 = getX(corpus2)

	var arr_data = await Promise.all([c1, c2])
	console.timeEnd(`X of ${corpus1}/${corpus2}`)

	var data_1 = arr_data[0]
	var data_2 = arr_data[1] //X_2 [{map, values}, {map, values}]

	var resultado = await processPromise(`${__dirname}/cp_jpp.js`, {data_1, data_2, k, lambda})
	return resultado
}

async function getX(corpus_id) {
	var documentos = await Document.find({_corpus: corpus_id}).exec();		
	documentos = documentos.map(doc => doc.toObject())

	if (!documentos.some(doc => doc.tweets.length > 70))
		throw new Error(`${corpus_id} no posee tweets`)

	var data = await processPromise(`${__dirname}/cp_corpus_2.js`, documentos)
	return data
}
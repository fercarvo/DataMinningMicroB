var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Corpus = new Schema({
    fecha: Date, //UTC time
    X: [[Number]],
    palabras: [String]
})

module.exports = mongoose.model('Corpus', Corpus);
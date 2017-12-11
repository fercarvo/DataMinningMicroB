var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Corpus = new Schema({
    fecha: Date, //UTC time
    X: [[Number]]
})

module.exports = mongoose.model('Corpus', Corpus);
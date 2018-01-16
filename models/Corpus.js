var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Corpus = new Schema({
    fecha: Date, //UTC time
    compressed: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Corpus', Corpus);
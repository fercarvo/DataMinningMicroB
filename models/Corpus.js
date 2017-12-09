var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Corpus = new Schema({
    fecha:  Date,
    X: [[Number]],
    documents: [{ 
        type: Schema.ObjectId, 
        ref: 'Documment'
    }]
})

module.exports = mongoose.model('Corpus', Corpus);
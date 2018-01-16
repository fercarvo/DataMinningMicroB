var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Document = new Schema({
    _corpus:  { 
        type: Schema.ObjectId, 
        ref: 'Corpus',
        required: true         
    },
    identificador: Number,
    tweets: [String]
})

module.exports = mongoose.model('Document', Document);
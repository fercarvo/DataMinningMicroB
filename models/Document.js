var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Document = new Schema({
    _corpus:  { 
        type: Schema.ObjectId, 
        ref: 'Corpus'         
    },
    identificador: Number
})

module.exports = mongoose.model('Document', Document);
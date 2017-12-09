var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Document = new Schema({
    _corpus:  { 
        type: Schema.ObjectId, 
        ref: 'Corpus'         
    },
    identificador: Number,
    tweets: [{ 
        type: Schema.ObjectId, 
        ref: 'Tweet'         
    }]
})

module.exports = mongoose.model('Document', Document);
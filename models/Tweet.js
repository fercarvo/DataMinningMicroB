var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Tweet = new Schema({
    _document:  { 
        type: Schema.ObjectId, 
        ref: 'Document',
        required: true         
    },
    tweet: String,
    id: Number,
    clean_data: [String],
    usuario: String
})

module.exports = mongoose.model('Tweet', Tweet);
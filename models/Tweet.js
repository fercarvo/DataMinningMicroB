var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Tweet = new Schema({
    _document:  { 
        type: Schema.ObjectId, 
        ref: 'Document',
        required: true         
    },
    tweet: String,
    id: Number
})

module.exports = mongoose.model('Tweet', Tweet);
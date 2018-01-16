var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Tweet = new Schema({
    _document:  { 
        type: Schema.ObjectId, 
        ref: 'Document',
        required: true         
    },
    tweet: String
})

module.exports = mongoose.model('Tweet', Tweet);
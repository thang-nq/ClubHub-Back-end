const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // user and post id
    content: {
        type: String,
        required: true
    },

    createAt: {
        type: String
    }


})

let Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};


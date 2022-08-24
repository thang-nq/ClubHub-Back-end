const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    // },

    content: {
        type: String,
        required: true
    },

    timeCreated: {
        type: Date,
        default: Date.now
    }

})

let Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};
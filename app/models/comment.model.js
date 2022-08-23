const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref : 'user'
    // },

    content: {
        type: String,
        required: true
    },
    
});


let Comments = mongoose.model('Comment', commentSchema);

module.exports = {Comments};

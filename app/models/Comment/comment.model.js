const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true

    },
    year:{
        type: Number,
        required: true
    },
    books:[
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Books"
        },
    ],
});


const bookSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    pushlishedDate:{
        type:String,
        
    },
    genres:{
        type:[String],

    },
    author:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Author"
    },
});

let Books = mongoose.model('Books',bookSchema);
let Author = mongoose.model('Author',authorSchema);

module.exports = {Books,Author};
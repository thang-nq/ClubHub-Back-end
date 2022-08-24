const mongoose = require('mongoose')
const Post = mongoose.model(
    "Post",
    new mongoose.Schema({

        createAt: {
            type: String,
            required: true
        },
        updateAt: String,

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        authorUsername: String,
        location: String,

        content: {
            type: String,
            required: true
        },

        images: [
            {
                type: String
            }
        ],

        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]


    })
)

module.exports = Post
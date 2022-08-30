const mongoose = require('mongoose')
const Post = mongoose.model(
    "Post",
    new mongoose.Schema({

        createAt: String,
        updateAt: String,

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        club: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club"
        },

        viewMode: {
            type: String,
            enum: ["public", "internal"],
            default: "public"
        },

        location: String,

        content: String,

        images: [
            {
                url: String,
                key: String
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
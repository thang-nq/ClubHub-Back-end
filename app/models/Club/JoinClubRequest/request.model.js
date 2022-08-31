const mongoose = require('mongoose')
const JoinRequest = mongoose.model(
    "joinrequest",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        club: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club",
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "accept", "reject"],
            default: "pending"
        },

        message: String,

        createAt: String


    })
)


module.exports = JoinRequest
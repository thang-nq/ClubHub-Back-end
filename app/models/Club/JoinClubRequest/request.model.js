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
            type: {
                type: mongoose.Schema.Types.ObjectId,

            }
        },

        status: {
            type: String,
            enum: ["pending", "accept", "reject"],
            default: "pending"
        },


    })
)


module.exports = JoinRequest
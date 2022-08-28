const mongoose = require('mongoose')
const Club = mongoose.model(
    "Club",
    new mongoose.Schema({
        name: {
            type: String,
            required: true
        },

        slogan: {
            type: String,
            default: "Welcome to our club!"
        },

        description: {
            type: String,
            require: true
        },

        logoUrl: {
            type: String,
            default: "https://ui-avatars.com/api/?name=RMIT"
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        president: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        featureImages: [
            {
                type: String
            }
        ],

        email: {
            type: String,
            required: true
        },

        events: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event"
            }
        ],
    })
)

module.exports = Club
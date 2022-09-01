const mongoose = require('mongoose')
const Club = mongoose.model(
    "Club",
    new mongoose.Schema({
        name: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Active"],
            default: "Pending"
        },

        acceptingMember: {
            type: String,
            enum: ["yes", "no"],
            default: "yes"
        },

        slogan: {
            type: String,
            default: "Welcome to our club!",
            required: true
        },

        description: {
            type: String,
            default: "This is a club at RMIT",
            required: true
        },

        logoUrl: String,
        backgroundUrl: String,

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
                url: String,
                key: String
            }
        ],

        email: {
            type: String,
            required: true
        },

        clubCategory: {
            type: String,
            enum: ["Sport", "Tech", "Art", "Games", "Hobbies", "Academic"],
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
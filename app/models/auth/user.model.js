const mongoose = require('mongoose')
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },

        snumber: String,
        createdClub: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club"
        },

        clubs: [
            {
                club: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Club"
                },

                role: {
                    type: String,
                    enum: ["user", "content-writer", "president"]
                }
            }

        ],

        isAdmin: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        },


        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        avatarUrl: String,
        dob: String,
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other'
        },
        phone: String,
        accstatus: {
            type: String,
            enum: ['Pending', 'Active', 'Banned'],
            required: true,
            default: 'Pending'
        },
        confirmationCode: {
            type: String,
            unique: true
        },

        roles: {
            type: String,
            enum: ["user", "clubprez", "clubcw", "admin"],
            default: 'user',
            require: true
        }
    })
)

module.exports = User
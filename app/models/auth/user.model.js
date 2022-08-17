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

        username: {
            type: String,
            required: true
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
        status: {
            type: String,
            enum: ['Pending', 'Active'],
            default: 'Pending'
        },
        confirmationCode: {
            type: String,
            unique: true
        },

        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ]
    })
)

module.exports = User
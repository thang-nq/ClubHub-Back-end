const mongoose = require('mongoose')

const PasswordReset = mongoose.model(
    'PasswordReset',
    new mongoose.Schema({
        userId: String,
        token: String,
        createAt: Date,
        expiresAt: Date
    })
)

module.exports = PasswordReset
const mongoose = require('mongoose')
const { handler } = require('../../handler/handler')

const PasswordReset = mongoose.model(
    'PasswordReset',
    new mongoose.Schema({
        userId: String,
        token: String,
        createAt: {
            type: String,
            default: handler.getCurrentTime()
        },
    })
)

module.exports = PasswordReset
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
        expireAt: {
            type: Date,
            default: Date.now(),
            index: { expires: 900 }
        }
    })
)

module.exports = PasswordReset
const mongoose = require('mongoose')

const Notification = mongoose.model(
    "Notification",
    new mongoose.Schema({
        createAt: {
            type: String,
            index: { expires: 20 }
        },
        club: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club"
        },

        message: String,

        expireAt: {
            type: Date,
            default: Date.now(),
            index: { expires: 86400 }
        }


    })
)
Notification.createIndexes({ createAt: 1, expireAfterSeconds: 10 })

module.exports = Notification
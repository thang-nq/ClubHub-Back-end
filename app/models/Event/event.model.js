const mongoose = require('mongoose')

const Event = mongoose.model(
    "Event",
    new mongoose.Schema({

        name: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: "This is an event discription"
        },

        startDate: String,
        endDate: String,

        status: {
            type: String,
            enum: ["Ongoing", "Pending", "End"],
            default: "Pending"
        },

        issueClub: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Club"
        },


    })
)

module.exports = Event
const db = require('./../models')
const Event = db.event

// Create new event 
exports.createNewEvent = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}
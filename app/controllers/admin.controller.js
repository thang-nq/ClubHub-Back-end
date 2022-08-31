const db = require('./../models')
const User = db.user
const Post = db.post
const Club = db.club
const Comment = db.comment

// Admin will have all control over the application data

// Get all clubs
exports.getAllClub = async (req, res) => {
    try {
        const clubs = await Club.find()
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

exports.approveClubCreate = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}




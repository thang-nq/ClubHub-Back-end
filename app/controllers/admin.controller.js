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





// Get all pending clubs
exports.getClubCreateRequests = async (req, res) => {
    try {
        const clubs = await Club.find({ status: "Pending" })
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Set club status to active 
exports.approveClubCreateRequests = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Failed to approve, club not found!" })
        }
        club.status = "Active"
        await club.save()
        return res.status(200).send({ message: `Approve club successfully, this club ${club.name} is now active!` })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// 





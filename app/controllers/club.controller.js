const db = require('./../models')
const Club = db.club
const User = db.user

// Get all clubs data
exports.getAllClub = async (req, res) => {
    try {
        const clubs = await Club.find().populate("president", "username avatarUrl")
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}

// Get a club data
exports.getClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id).populate("president", "username avatarUrl")
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        return res.status(200).send(club)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

// Create a new club after verify the user is club president
exports.createClub = async (req, res) => {
    try {

        const logo = req.file.filename || `https://ui-avatars.com/api/?name=${req.body.name}&background=0D8ABC&color=fff&size=128`

        const club = new Club({
            name: req.body.name,
            slogan: req.body.slogan,
            logoUrl: logo,
            president: req.userId,
            email: req.body.email,
        })
        // Club president also count as member
        club.members.push(req.userId)
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

exports.setClubStatus = async (req, res) => {

}
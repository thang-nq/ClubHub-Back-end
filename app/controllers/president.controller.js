const db = require('./../models')
const User = db.user
const JoinClubRQ = db.joinrequest
const Club = db.club


// Get all pending request of a club
exports.getClubJoinRequest = async (req, res) => {
    try {
        const requests = await JoinClubRQ.find({ club: req.params.clubId, status: "pending" })
        return res.status(200).send(requests)

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Approve a pending request and add the user to the club
exports.approveMember = async (req, res) => {
    try {
        // Check if request, club, user are all existed in the database
        const request = await JoinClubRQ.findById(req.params.requestId)
        if (!request) {
            return res.status(404).send({ message: "Error! Request not found!" })
        }
        console.log(request.club)
        const club = await Club.findById(request.club)
        if (!club) {
            return res.status(404).send({ message: "Error! Club not found" })
        }
        const user = await User.findById(request.user)
        if (!user) {
            return res.status(404).send({ message: "Error! User not found" })
        }

        // If the member has been added to the club by admin
        for (const member of club.members) {
            if (member.toString() === user.id) {
                await request.delete()
                return res.status(402).send({ message: "Error! Cant approve, user already in this club, this request will be automatically deleted!" })
            }
        }

        // Add member to the club
        club.members.push(user._id)
        await club.save()

        return res.status(200).send({ message: "Success!", action: `User ${user.username} has been added to the club ${club.name}` })


    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

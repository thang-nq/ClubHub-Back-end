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
exports.approveOrRecjectMember = async (req, res) => {
    try {

        // Check if request, club, user are all existed in the database
        const request = await JoinClubRQ.findById(req.body.requestId)
        if (!request) {
            return res.status(404).send({ message: "Error! Request not found!" })
        }

        const club = await Club.findById(request.club)
        if (!club) {
            await request.delete()
            return res.status(404).send({ message: "Error! Club not found, this request will be deleted" })
        }

        const user = await User.findById(request.user)
        if (!user) {
            await request.delete()
            return res.status(404).send({ message: "Error! User not found, this request will be deleted" })
        }

        if (req.body.action !== 'approve' || req.body.action !== 'reject') {
            return res.status(402).send({ Error: "Please choose one action 'approve' or 'reject' in the 'action' request body" })
        }
        // If the member has been added to the club by admin
        for (const member of club.members) {
            if (member.toString() === user.id) {
                await request.delete()
                return res.status(402).send({ message: "Error! This user already in this club, this request will be automatically deleted!" })
            }
        }

        if (req.body.action === 'approve') {
            await club.update({ $push: { members: request.user } })
        } else if (req.body.action === 'reject') {
            await club.update({ $pull: { members: request.user } })
        }

        // Add member to the club, delete the request
        await request.delete()

        return res.status(200).send({ message: "Success!", action: `User ${user.username} has been ${req.body.action} - club ${club.name}` })


    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Get all members of the club
exports.getAllClubMembers = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId).populate("president members", "name username avatarUrl roles dob phone snumber gender")
        return res.status(200).send({ message: "Success", members: club.members, memberCount: club.members.length })
    } catch (error) {
        return res.status(500).send({ Error: error })
    }
}

// Set a member role to club content writer
exports.clubMemberSetRole = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        const member = club.members.find(member => member.toString() === req.body.userId)
        if (!member) {
            return res.status(403).send({ Error: "This user is not in this club" })
        }
        const memberData = await User.findById(req.body.userId)
        if (!memberData) {
            return res.status(404).send({ Error: "Member data not found on the server!" })
        }

        console.log()
        if (req.body.roles === "user" || req.body.roles === "clubcw") {
            memberData.roles = req.body.roles
            await memberData.save()
            return res.status(200).send({ message: `Set user ${memberData.username} to ${memberData.roles} successfully!` })
        }
        return res.status(403).send({ Error: "Can only set member to Content writer or normal user!" })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Kick member from club

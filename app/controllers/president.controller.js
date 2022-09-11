const { handler } = require('../handler/handler')
const db = require('./../models')
const User = db.user
const JoinClubRQ = db.joinrequest
const Club = db.club



// Get club info
exports.getClubInfo = async (req, res) => {
    try {
        const president = await User.findById(req.userId)
        if (!president.createdClub) {
            return res.status(404).send({ message: "You havent created a club!" })
        }
        const club = await Club.findById(president.createdClub).populate("president", "username name avatarUrl")
        if (!club) {
            await president.updateOne({ $unset: { createdClub: "" }, $pull: { clubs: { club: president.createdClub } } })

            return res.status(404).send({ message: "Club was deleted from the server" })
        }
        if (club.status === 'Pending') {
            return res.status(200).send({ clubName: club.name, status: club.status })
        }
        return res.status(200).send({ clubData: club, memberCount: club.members.length })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Get all pending request of a club
exports.getClubJoinRequest = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        const requests = await JoinClubRQ.find({ club: user.createdClub, status: "pending" }).populate("user", "username name gender avatarUrl")
        return res.status(200).send(requests)

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}



// Approve a pending request and add the user to the club
exports.approveOrRecjectMember = async (req, res) => {
    try {

        const president = await User.findById(req.userId)

        // Check if request, club, user are all existed in the database
        const request = await JoinClubRQ.findById(req.body.requestId)
        if (!request) {
            return res.status(404).send({ message: "Error! Request not found!" })
        }

        if (president.createdClub.toString() !== request.club.toString()) {
            return res.status(403).send({ message: "Error! You dont have permission to process this request" })
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

        if (req.body.action !== 'approve' && req.body.action !== 'reject') {
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
            await club.updateOne({ $push: { members: request.user } })
        }

        const clubObject = {
            club: club.id,
            role: "Member",
            joinDate: handler.getCurrentTime()
        }
        await user.updateOne({ $push: { clubs: clubObject } })


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
        const user = await User.findById(req.userId)
        if (!user.createdClub) {
            return res.status(404).send({ message: "You haven't created a club yet!" })
        }
        const club = await Club.findById(user.createdClub).populate("president members", "name username avatarUrl clubs roles dob phone snumber gender")
        return res.status(200).send({ message: "Success", clubId: club.id, members: club.members, memberCount: club.members.length })
    } catch (error) {
        return res.status(500).send({ Error: error })
    }
}

// Set a member role to club content writer
exports.clubMemberSetRole = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user.createdClub) {
            return res.status(404).send({ message: "You haven't created a club yet!" })
        }
        const club = await Club.findById(user.createdClub)

        // Check if member is in the club
        const member = club.members.find(member => member.toString() === req.body.userId)
        if (!member) {
            return res.status(403).send({ Error: "This user is not in your club" })
        }

        // If the member is in the club, get the member data from database
        const memberData = await User.findById(req.body.userId)
        if (!memberData) {
            return res.status(404).send({ Error: "Member data not found on the server!" })
        }

        if (req.body.role === "Member" || req.body.role === "Content Writer") {
            await User.updateOne({ username: memberData.username, "clubs.club": club.id }, { $set: { "clubs.$.role": req.body.role } })
            return res.status(200).send({ message: `Set user ${memberData.username} to ${req.body.role} successfully!` })

        }
        return res.status(403).send({ Error: "Can only set member to Content writer or normal user!" })
    } catch (error) {
        return res.status(500).send({ Error: error })
    }
}

// Kick member from club
exports.kickMember = async (req, res) => {
    try {
        // Check if user is a president of a club
        const president = await User.findById(req.userId)
        const club = await Club.findById(president.createdClub)
        if (!club) {
            return res.status(404).send({ message: "You havent created a club yet" })
        }

        if (req.params.userId === president.id) {
            return res.status(400).send({ message: "Error, you cant kick yourself" })
        }
        const member = await User.findById(req.params.userId)
        if (!member) {
            return res.status(404).send({ message: "Error! Member not found!" })
        }
        if (!club.members.includes(member.id)) {
            return res.status(404).send({ message: "Error! This user is not in your club!" })
        }


        await club.updateOne({ $pull: { members: member._id } })
        await member.updateOne({ $pull: { clubs: { club: club.id } } })
        return res.status(200).send({ message: "Kick member success" })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Update club
exports.updateClub = async (req, res) => {
    try {

        // Check president role and club existed
        const president = await User.findById(req.userId)
        const club = await Club.findById(president.createdClub)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        if (club.president.toString() !== req.userId) {
            return res.status(401).send({ message: "You are not the president of this club!" })
        }
        club.acceptingMember = req.body.acceptingMember || club.acceptingMember
        club.slogan = req.body.slogan || club.slogan
        club.description = req.body.description || club.description
        club.email = req.body.email || club.email
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}
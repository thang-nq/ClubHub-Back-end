const db = require('./../models')
const { deleteImage } = require('./../handler/handleImagesUpload')
const { handler } = require('../handler/handler')
const User = db.user
const Post = db.post
const Club = db.club
const Comment = db.comment

// Admin will have all control over the application data

// Get all clubs
exports.getAllClub = async (req, res) => {
    try {
        const clubs = await Club.find().populate("president members", "username avatarUrl")
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}





// Get all pending clubs
exports.getClubCreateRequests = async (req, res) => {
    try {
        const clubs = await Club.find({ status: "Pending" }).populate("president members", "username avatarUrl")
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Set club status to active 
exports.setClubStatus = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Failed to approve, club not found!" })
        }
        club.status = req.body.status
        await club.save()
        return res.status(200).send({ message: `Action success!, this club ${club.name} is now ${req.body.status}!` })
    } catch (error) {
        return res.status(500).send({ Error: error })
    }
}

// Delete a club
exports.deleteClub = async (req, res) => {
    try {

        const clubToDelete = await Club.findById(req.params.clubId)
        if (!clubToDelete) {
            return res.status(404).send({ Error: "Club not found!" })
        }
        const posts = await Post.find({ club: req.params.clubId })
        // Revoke all role from members in club
        for (const member of clubToDelete.members) {
            await User.findByIdAndUpdate(member, { $pull: { clubs: { club: clubToDelete.id } } })
        }
        const president = await User.findByIdAndUpdate(clubToDelete.president, { $unset: { createdClub: "" } })

        let totalImg = 0
        let totalComment = 0
        if (posts.length > 0) {
            for (const post of posts) {
                if (post.comments.length > 0) {
                    for (const comment of post.comments) {
                        await Comment.findByIdAndDelete(comment)
                        totalComment++
                    }
                }

                // Delete post images on amazon s3

                if (post.images.length > 0) {
                    post.images.forEach(image => {
                        totalImg++
                        deleteImage(image.key)
                    })
                }
            }
        }

        await clubToDelete.deleteOne()

        return res.status(200).send({ message: `Success! Deleted club ${clubToDelete.name}` })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Set user account status
exports.setUserAccountStatus = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId)
        if (!user) {
            return res.status(404).send({ message: "Error! User not found!" })
        }
        if (req.body.status !== 'Active' && req.body.status !== 'Banned') {
            return res.status(400).send({ error: "Wrong parameter format" })
        }
        user.accstatus = req.body.status
        await user.save()
        return res.status(200).send({ message: `Success! Set user ${user.username} account to ${req.body.status}` })

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Get list of user not in a a club
exports.searchUserNotInClub = async (req, res) => {
    try {

        const userProjection = { password: 0, confirmationCode: 0 }
        if (!req.body.value || !req.body.clubId) {
            return res.status(400).send({ message: "Missing search value or clubId" })
        }
        const payload = req.body.value.trim()
        const user = await User.findOne({ $and: [{ snumber: { $regex: new RegExp('^' + payload + '.*', 'i') } }, { "clubs": { $not: { $elemMatch: { club: req.body.clubId } } } }] }, userProjection)

        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Admin add user to club
exports.addUserToClub = async (req, res) => {
    try {
        if (!req.body.clubId || !req.body.userId || !req.body.role) {
            return res.status(400).send({ message: "Error, missing clubId or userId or role" })
        }

        if (req.body.role !== 'Member'
            && req.body.role !== 'Content Writer') {
            return res.status(400).send({ message: "Invalid role, must be { Member, Writer}" })
        }


        const user = await User.findById(req.body.userId)
        if (!user) {
            return res.status(404).send({ message: "Error, user not found!" })
        }


        const club = await Club.findById(req.body.clubId)
        if (!club) {
            return res.status(404).send({ message: "Error! Club not found!" })
        }

        if (club.members.includes(user._id)) {
            return res.status(400).send({ message: "Error! This user is already in this club!" })
        }

        const clubObject = {
            club: club.id,
            role: req.body.role,
            joinDate: handler.getCurrentTime()
        }
        await user.updateOne({ $push: { clubs: clubObject } })
        await club.updateOne({ $push: { members: user.id } })

        return res.status(200).send({ message: `Success! Add member ${user.username} to ${club.name} as ${req.body.role} successfull` })

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Admin remove user from a club
exports.removeUserFromClub = async (req, res) => {
    try {
        if (!req.body.clubId || !req.body.userId) {
            return res.status(400).send({ message: "Empty clubId or userId" })
        }
        const user = await User.findById(req.body.userId)
        if (!user) {
            return res.status(404).send({ message: "User not found!" })
        }
        const club = await Club.findById(req.body.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }

        if (!club.members.includes(user._id)) {
            return res.status(400).send({ message: "Error, this user is not a member of this club" })
        }

        if (club.president._id.toString() === user.id) {
            await club.updateOne({ $unset: { president: "" } })
            await user.updateOne({ $unset: { createdClub: "" } })
        }

        await club.updateOne({ $pull: { members: user._id } })
        await user.updateOne({ $pull: { clubs: { club: club.id } } })

        return res.status(200).send({ message: `Remove user ${user.username} from ${club.name} successful!` })

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Change club member role
exports.changeMemberRole = async (req, res) => {
    try {

        // Check valid role in request body
        if (req.body.role !== 'President' && req.body.role !== 'Content Writer' && req.body.role !== 'Member') {
            return res.status(400).send({ Error: "Invalid role parameter {President, Content Writer, Member}" })
        }

        // Check club exist
        const club = await Club.findById(req.body.clubId)
        if (!club) {
            return res.status(404).send({ Error: "Club not found!" })
        }

        // Check memeber exist
        const member = await User.findById(req.body.userId)
        if (!member) {
            return res.status(404).send({ Error: "Member not found!" })
        }

        // Check if the member is president, set to another role will demote the president, the club president position will be empty untill admin set another member for president
        if (club.president) {
            // Demote president
            if (club.president.toString() === req.body.userId) {
                if (req.body.role !== 'President') {
                    await club.updateOne({ $unset: { president: "" } })
                    await member.updateOne({ $unset: { createdClub: "" } })
                }
            }

            if (req.body.role === 'President') {
                return res.status(400).send({ message: "This club already have a president, please try again" })
            }
        }
        else {
            // If user is not president and admin set that user to president
            if (req.body.role === 'President') {
                //If user is already a president of another club
                if (member.createdClub) {
                    return res.status(401).send({ message: `This user is already a president of another club` })
                }
                await member.updateOne({ $set: { createdClub: club.id } })
                await club.updateOne({ $set: { president: member._id } })
            }
        }


        // Update club role to corresponding value
        await User.updateOne({ username: member.username, "clubs.club": club.id }, { $set: { "clubs.$.role": req.body.role } })
        return res.status(200).send({ message: `Success! ${member.username} 's role is now ${req.body.role}` })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}






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
        // for (const member of clubToDelete.members) {
        //     await User.findByIdAndUpdate(member, { $pull: { "clubs.$.club": clubToDelete.id } })
        // }

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

        return res.status(200).send({ message: `Success! Deleted club ${clubToDelete.name} and ${posts.length} post(s) with ${totalImg} image(s), ${totalComment} comment(s) create by the club` })
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
        const users = await User.find({ $and: [{ snumber: { $regex: new RegExp('^' + payload + '.*', 'i') } }, { "clubs": { $not: { $elemMatch: { club: req.body.clubId } } } }] }, userProjection)

        return res.status(200).send(users)
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

        if (req.body.role !== 'president'
            && req.body.role !== 'user'
            && req.body.role !== 'writer') {
            return res.status(400).send({ message: "Invalid role, must be {president, user, writer}" })
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

        await club.updateOne({ $pull: { members: user._id } })
        await user.updateOne({ $pull: { clubs: { club: club.id } } })

        return res.status(200).send({ message: `Remove user ${user.username} from ${club.name} successful!` })

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}






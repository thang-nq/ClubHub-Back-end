const db = require('./../models')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { handler } = require('../handler/handler')
const Club = db.club
const User = db.user
const JoinClubRQ = db.joinrequest

// Get all clubs data
exports.getAllClub = async (req, res) => {
    try {
        const recruit_query = req.query.recruit
        if (recruit_query == 'true') {
            const clubs = await Club.find({ status: "Active", acceptingMember: "yes" }).populate("president", "username avatarUrl")
            return res.status(200).send(clubs)
        }
        const clubs = await Club.find({ status: "Active" }).populate("president", "username avatarUrl")
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}



// Get a club data
exports.getClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId).populate("president members", "username avatarUrl roles")
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
        const existedClub = Club.find({ president: req.userId })
        if (existedClub) {
            return res.status(403).send({ Error: "You already create a club, each president is limit to 1 club" })
        }
        const processedName = req.body.name.replaceAll(" ", "")
        const logo = `https://source.boringavatars.com/bauhaus/120/${processedName}`
        const club = new Club({
            name: req.body.name.trim(),
            slogan: req.body.slogan,
            description: req.body.description,
            logoUrl: logo,
            president: req.userId,
            clubCategory: req.body.category,
            email: req.body.email.toLowerCase().trim(),
        })
        // Club president also count as member
        club.members.push(req.userId)
        const savedClub = club.save((err, result) => {
            if (err) {
                let customErrMessage = err.message
                if (err.code === 11000) {
                    customErrMessage = "Club name already taken"
                }

                return res.status(500).send({ error: customErrMessage })
            }

            return res.status(200).send(result)
        })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Update a club opening status, require president account
exports.setClubStatus = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        club.acceptingMember = req.body.acceptingMember
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

// Delete a club, require admin account
exports.deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }

        await club.remove()
        return res.status(200).send({ message: "Club deleted!" })
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

// Update club logo, require president account
exports.updateClubLogo = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        return res.status(200).send()
    } catch (error) {
        return res.status(500).send(error)
    }
}

// Update club background image, require president account
exports.updateClubBackgroundImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(401).send({ message: "Please choose 1 image to upload (jpeg, png, jpg)" })
        }
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Error! Cant upload background. Club not found" })
        }

        club.backgroundUrl = req.file.location
        await club.save()
        return res.status(200).send({ message: "Upload success", backgroundUrl: req.file.location })
    } catch (error) {
        return res.status(500).send(error)
    }
}

// exports.updateClubBg = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(401).send({ message: "Please choose 1 image to upload (jpeg, png, jpg)" })
//         }
//         const club = await Club.findById(req.params.clubId)
//         if (!club) {
//             return res.status(404).send({ message: "Error! Cant upload background. Club not found" })
//         }

//         club.backgroundUrl = req.file.location
//         await club.save()
//         return res.status(200).send({ message: "Upload success", backgroundUrl: req.file.location })
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// }

// Update club data, require president account
exports.updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        if (club.president !== req.userId) {
            return res.status(401).send({ message: "You are not the president of this club!" })
        }
        club.name = req.body.name || club.name
        club.slogan = req.body.slogan || club.slogan
        club.description = req.body.description || club.description
        club.email = req.body.email || club.email
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

// Send request to a join a club
exports.requestToJoinClub = async (req, res) => {
    try {
        const joinRequest = await JoinClubRQ.findOne({ user: req.userId }, { club: req.params.clubId })
        if (joinRequest) {
            return res.status(402).send({ message: "Error! Already sent request to this club" })
        }
        const currentTime = handler.getCurrentTime()
        const newRequest = new JoinClubRQ({
            user: req.userId,
            club: req.params.clubId,
            message: req.body.message,
            createAt: currentTime
        })
        await newRequest.save()

        return res.status(200).send({ message: "Request send successfully, please wait for president approval!" })
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}

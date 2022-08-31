const db = require('./../models')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
const Club = db.club
const User = db.user

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
        const processedName = req.body.name.replaceAll(" ", "")
        const logo = `https://source.boringavatars.com/bauhaus/120/${processedName}`
        const club = new Club({
            name: req.body.name.trim(),
            slogan: req.body.slogan,
            description: req.body.description,
            logoUrl: logo,
            president: req.userId,
            email: req.body.email.toLowerCase().trim(),
        })
        // Club president also count as member
        club.members.push(req.userId)
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Update a club opening status, require admin account
exports.setClubStatus = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        club.status = req.body.status
        const savedClub = await club.save()
        return res.status(200).send(savedClub)
    } catch (error) {
        return res.status(500).send({ message: "Internal error!" })
    }
}

// Delete a club, require admin account
exports.deleteClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
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
        // Check if the user is club president
        if (req.userId != club.president._id.toString) {
            return res.status(403).send({ message: "You are not the president of this club, cant update" })
        }
    } catch (error) {
        return res.status(500).send(error)
    }
}

// Update club data, require president account
exports.updateClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
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

}

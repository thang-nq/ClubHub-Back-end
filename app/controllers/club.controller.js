const db = require('./../models')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { handler } = require('../handler/handler')
const Post = require('../models/Post/post.model')
const Club = db.club
const User = db.user
const JoinClubRQ = db.joinrequest

// Get all clubs data
exports.getAllClub = async (req, res) => {
    try {
        const recruit_query = req.query.recruit
        if (recruit_query == 'true') {
            const clubs = await Club.find({ status: "Active", acceptingMember: "yes" }).populate("president members", "username name avatarUrl")
            return res.status(200).send(clubs)
        }
        const clubs = await Club.find({ status: "Active" }).populate("president members", "username name avatarUrl")
        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ error: error })
    }
}



// Get a club data
exports.getClub = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId).populate("president", "name username avatarUrl").populate({
            path: "members",
            model: "User",
            select: "name username avatarUrl snumber email gender clubs"
        })
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        if (club.status !== 'Active') {

            return res.status(403).send({ message: "This club is not active, please come back when approved by admin" })
        }

        return res.status(200).send({ clubData: club, memberCount: club.members.length })
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Create a new club after verify the user is club president
exports.createClub = async (req, res) => {
    try {
        const president = await User.findById(req.userId)
        if (president.createdClub) {
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
            createDate: handler.getCurrentTime()
        })
        // Club president also count as member
        club.members.push(req.userId)

        // Add president role for the club creator
        const clubObject = {
            club: club.id,
            role: "President",
            joinDate: handler.getCurrentTime()
        }


        // Save club as pending and wait for admin to approve
        const savedClub = club.save((err, result) => {
            if (err) {
                let customErrMessage = err.message
                if (err.code === 11000) {
                    customErrMessage = "Club name already taken"
                }

                return res.status(500).send({ error: customErrMessage })
            }

            User.findByIdAndUpdate(req.userId, { $push: { clubs: clubObject }, $set: { createdClub: club.id } }).exec().then(result => console.log('New create club request'))

            return res.status(200).send({ message: "Club creation request send success!", clubInfo: result })
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
        if (!req.file) {
            return res.status(400).send({ Error: "Upload 1 img type PNG, JPG, JPEG" })
        }
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }
        club.logoUrl = req.file.location
        await club.save()
        return res.status(200).send({ message: "Upload logo success", logoUrl: club.logoUrl })
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
        const joinRequest = await JoinClubRQ.findOne({ user: req.userId, club: req.params.clubId })
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


exports.getFeatureImages = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ message: "Club not found!" })
        }

        let featuresImage = []
        const posts = await Post.find({ club: req.params.clubId }).sort({ createAt: -1 })
        posts.forEach(post => {
            if (post.images.length > 0) {
                featuresImage.push(post.images[0])
            }
        })

        if (featuresImage.length > 0) {

            featuresImage = featuresImage.slice(0, 6)
        }

        return res.status(200).send(featuresImage)

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

// Get club event
exports.getEvents = async (req, res) => {
    try {
        const events = [
            {
                _id: "clubevent_badminton",
                name: "RMIT Badminton Tournament 2022",
                startDate: "10/11/2022",
                location: "Sport Hall",
                imageUrl: ["https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent1.jpeg", "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent1-3.jpeg"]
            },
            {
                _id: "clubevent_recruitment",
                name: "Recruitment Program",
                startDate: "19/10/2022",
                location: "Rmit Vietnam",
                imageUrl: ["https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent2.jpeg", "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent2-1.png"]
            },
            {
                _id: "clubevent_symposium",
                name: "Global Symposium 2022",
                startDate: "02/01/2023",
                location: "Building 2",
                imageUrl: ["https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent4.jpeg",
                    "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent4-1.png",
                    "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent4-2.png"
                ],
            },
            {
                _id: "clubevent_globalexp",
                name: "Global Experience 2022",
                startDate: "10/11/2022",
                location: "RMIT Vietnam",
                imageUrl: ["https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent3.jpeg",
                    "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent3-1.png",
                    "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent3-2.png",
                    "https://rmitclubhub-bucket.s3.ap-southeast-1.amazonaws.com/rmitevent3-3.png"
                ]
            },
        ]

        return res.status(200).send(events)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}
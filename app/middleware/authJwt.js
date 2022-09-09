const jwt = require('jsonwebtoken')
const db = require('./../models')
const User = db.user
const Club = db.club

//Verify if token is valid
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    let token = ''
    try {
        token = authHeader.split(' ')[1]
    } catch (err) {

        return res.status(401).send({ message: "Incorrect token format" })
    }

    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            return res.status(403).send({ message: "Token validation failed" })
        }
        User.findById(data.userId).exec((err, user) => {
            if (err) {
                return res.status(500).send({ message: err })
            }

            //if user is not found then send error message
            if (!user) {
                return res.status(404).send({ message: "User not found!" })
            }
            req.userId = user.id
            return next()
        })
    })
}


//Find a user by id and check if the role exist
const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId)
    if (user.isAdmin) {
        return next()
    }

    return res.status(403).send({ message: "Fail! Admin permission required!" })
}




const isClubPrez = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId)
        console.log(user.clubs)
        let isAllowed = false
        if (user.clubs.length > 0) {
            user.clubs.forEach(club => {
                if (club.club.toString() === req.params.clubId && club.role === "President") {
                    isAllowed = true
                }
            })
        }

        if (isAllowed) {
            return next()
        }

        return res.status(403).send({ message: "Fail! Club president account required" })

    } catch (error) {
        return res.status(500).send({ message: error })
    }

}

const isClubCW = async (req, res, next) => {

    try {
        const user = await User.findById(req.userId)
        let isAllowed = false
        if (user.clubs.length > 0) {
            user.clubs.forEach(club => {
                if (club.club._id.toString() === req.params.clubId
                    && (club.role === "Writer" || club.role === "President")) {
                    isAllowed = true
                }
            })
        }

        if (isAllowed) {
            return next()
        }

        return res.status(403).send({ message: "Fail! Club content writer or president account required!" })
    } catch (error) {
        return res.status(500).send({ message: error })
    }


}

const isClubMember = async (req, res, next) => {
    try {
        // console.log(req.params.clubId)
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(200).send({ message: "Club not found" })
        }

        const userId = club.members.find(member => member.toString() === req.userId)
        if (!userId) {
            return res.status(404).send({ message: "Not a member of " + club.name })
        }
        return next()
    } catch (error) {
        return res.status(500).send(error)
    }
}

const isNotClubMember = async (req, res, next) => {
    try {
        console.log(req.params.clubId)
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(200).send({ message: "Club not found" })
        }

        const userId = club.members.find(member => member.toString() === req.userId)
        if (!userId) {

            return next()
        }
        return res.status(404).send({ message: `Error, user ${req.userId} already a member of ${club.name}` })
    } catch (error) {
        return res.status(500).send(error)
    }
}

const authJwt = {
    verifyToken,
    isAdmin,
    isClubPrez,
    isClubCW,
    isClubMember,
    isNotClubMember
}

module.exports = authJwt
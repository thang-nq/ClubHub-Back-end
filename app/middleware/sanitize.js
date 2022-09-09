const db = require("./../models")
const Club = db.club

// Regex
const emailRegex = "^[A-Za-z0-9._%+-]+@rmit.edu.vn$"
const passwordTest = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
const usernameRegex = "^[A-Za-z0-9._-]{8,16}$"
//


const sanitizeSignupRequest = (req, res, next) => {
    //Check missing input
    console.log(req.body)
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.dob) {
        return res.status(400).send({ message: "Missing one of the required parameter" })
    }

    //check valid role
    if (!req.body.roles) {
        req.body.roles = "user"
    } else {
        if ((req.body.roles !== "admin") && req.body.roles !== "clubprez") {

            return res.status(401).send({ message: `Role ${req.body.roles} is invalid` })
        }
    }

    //Check email format 
    if (!req.body.email.match(emailRegex)) {
        return res.status(400).send({ message: "Rmit email address required" })
    }

    //Check username format
    if (!req.body.username.match(usernameRegex)) {
        return res.status(400).send({ message: "Username must be from 8-16 characters,( . _ - are allowed )" })
    }

    //and password strength
    if (!passwordTest.test(req.body.password)) {
        return res.status(400).send({ message: "Password not meet the requirement" })
    }



    return next()
}

//Check if sign in request body is valid

const sanitizeSigninRequest = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(401).send({ message: "Missing parameter(s)" })
    }

    if (!req.body.email.match(emailRegex)) {
        return res.status(401).send({ message: "Require rmit email format" })
    }

    if (!passwordTest.test(req.body.password)) {
        return res.status(400).send({ message: "Password not meet the requirement" })
    }

    return next()
}

//Check if create club request body is valid
const sanitizeClubRequest = (req, res, next) => {
    if (!req.body.name || !req.body.email || req.body.description) {
        return res.status(400).send({ message: "Missing one or more compulsory parameters(name, description, email)" })
    }
    const clubname = req.body.name.trim()

    Club.findOne({ name: clubname }).exec((error, club) => {
        if (error) {
            return res.status(500).send({ message: error })
        }

        if (club) {
            return res.status(401).send({ message: "error! club name already exist" })
        }
    })
    return next()
}

const sanitizePasswordReset = (req, res, next) => {
    if (!req.body.email) {
        return res.status(401).send({ message: "missing email parameter" })
    }
    if (!req.body.email.match(emailRegex)) {
        return res.status(401).send({ message: "Fail! required rmit email" })
    }

    return next()
}

const sanitize = {
    sanitizeSignupRequest,
    sanitizeSigninRequest,
    sanitizeClubRequest,
    sanitizePasswordReset
}

module.exports = sanitize;
const db = require('./../models')

const User = db.user


// Check email duplication
checkDuplicateEmail = (req, res, next) => {

    // Lowercase before processing
    const rmitEmail = req.body.email.toLowerCase()
    User.findOne({
        email: rmitEmail
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (user) {
            return res.status(400).send({ message: `Sign up failed, email ${rmitEmail} already existed!` })
        }
        next()
    })

}


// Check username duplication
checkDuplicateUsername = (req, res, next) => {
    // Lowercase before processing
    const reqUsername = req.body.username.toLowerCase()
    User.findOne({
        username: reqUsername
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (user) {
            return res.status(400).send({ message: `Sign up failed, username ${reqUsername} already existed!` })
        }
        next()
    })
}


const verifySignUp = {
    checkDuplicateEmail,
    checkDuplicateUsername
}

module.exports = verifySignUp
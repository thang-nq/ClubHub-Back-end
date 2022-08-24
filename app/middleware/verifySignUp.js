const db = require('./../models')

const ROLES = db.ROLES
const User = db.user

checkDuplicateEmail = (req, res, next) => {

    //Verify email duplication
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (user) {
            return res.status(400).send({ message: "Sign up failed, email already existed!" })
        }
        next()
    })

}


const verifySignUp = {
    checkDuplicateEmail
}

module.exports = verifySignUp
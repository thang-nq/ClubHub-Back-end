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

checkValidRole = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                return res.status(400).send({
                    message: `Failed! Role ${req.body.role[i]} does not exist!`
                })
            }
        }
    }

    next()
}

const verifySignUp = {
    checkDuplicateEmail,
    checkValidRole
}

module.exports = verifySignUp
const config = require("./../config/auth.config")
const db = require('./../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('./../config/nodemailer.config')
const User = db.user
const Role = db.role

//Validate request body
const sanitizeRequest = (req) => {
    let testResult = {
        message: 'Pass',
        result: true
    }
    //Check missing input
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.dob) {
        testResult.result = false
        testResult.message = "Missing one of the required parameter"
        return testResult
    }

    //Check email format 
    const emailRegex = "^[A-Za-z0-9._%+-]+@rmit.edu.vn"
    const passwordTest = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
    if (!req.body.email.match(emailRegex)) {
        testResult.result = false
        testResult.message = "Rmit email address required"
        return testResult
    }

    //and password strength
    if (!passwordTest.test(req.body.password)) {
        testResult.result = false
        testResult.message = "Password not meet the requirement"
        return testResult
    }

    return testResult
}


//Signup controller
exports.signup = (req, res) => {
    //Check request validity
    const sanitizeResult = sanitizeRequest(req)
    if (!sanitizeResult.result) {
        return res.status(404).send({ message: sanitizeResult.message })
    }

    //If pass the check, generate a token
    const token = jwt.sign({ email: req.body.email }, config.secret)
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        username: req.body.username,
        avatarUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        gender: req.body.gender,
        dob: req.body.dob,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationCode: token
    })
    user.save((err, user) => {
        if (err) {
            return res.status(500).send({ message: err })
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        return res.status(500).send({ message: err })
                    }
                    user.roles = roles.map(role => role._id)
                    user.save(err => {
                        if (err) {
                            return res.status(500).send({ message: err })

                        }
                        nodemailer.sendConfirmationEmail(
                            user.name,
                            user.email,
                            user.confirmationCode
                        )
                        return res.status(200).send({ message: "Sign up successfully! Please check your email" })
                    })
                }
            )
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    return res.status(500).send({ message: err })
                }
                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        return res.status(500).send({ message: err })
                    }
                    nodemailer.sendConfirmationEmail(
                        user.name,
                        user.email,
                        user.confirmationCode
                    )

                    return res.status(200).send({ message: "Sign up as user successfully! Please check your email" })
                })
            })
        }
    })
}


//Signin controller
exports.signin = (req, res) => {
    if (!sanitizeRequest(req)) {
        return res.status(404).send({ message: "Invalid email or password format!" })
    }
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                return res.status(500).send({ message: err })
            }
            if (!user) {
                return res.status(404).send({ message: "Email not found!" })
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            )
            if (!passwordIsValid) {
                return res.status(401).send({ accessToken: null, message: "Incorrect password" })
            }

            if (user.status != 'Active') {
                return res.status(401).send({ message: "Please check your email to activate this account!" })
            }

            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 })
            let authorities = []
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
            }
            return res.status(200).send({
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                dob: user.dob,
                avatarUrl: user.avatarUrl,
                roles: authorities,
                accessToken: token
            })
        })
}

//Email verification controller
exports.verifyUser = (req, res) => {
    User.findOne({
        confirmationCode: req.params.confirmationCode
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: 'User not found.' })
            }

            user.status = "Active"
            user.save((err) => {
                if (err) {
                    return res.status(500).send({ message: err })
                }

                return res.status(200).send("Account activation success!")
            })
        })
        .catch((e) => console.log("error", e))
}

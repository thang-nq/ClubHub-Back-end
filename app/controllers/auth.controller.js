const db = require('./../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('./../config/nodemailer.config')
const User = db.user
const Role = db.role



//Signup controller
exports.signup = (req, res) => {

    //If pass the check, generate a token base on email address
    const token = jwt.sign({ email: req.body.email }, process.env.SECRET)
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

    // Find user then append roles from role id
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

            let token = jwt.sign({ id: user._id }, process.env.SECRET)
            let authorities = []
            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
            }
            return res.status(200).send({
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                // dob: user.dob,
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

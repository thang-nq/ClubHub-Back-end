const db = require('./../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('./../config/nodemailer.config')
const User = db.user



//Signup controller
exports.signup = (req, res) => {

    //If pass the check, generate a token base on email address
    const username = req.body.username.toLowerCase()
    // return res.status(200).send({ rmitEmail })
    const token = jwt.sign({ email: req.body.email }, process.env.SECRET)
    const user = new User({
        email: req.body.email,
        name: req.body.name,
        username: username,
        avatarUrl: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250",
        gender: req.body.gender,
        dob: req.body.dob,
        phone: req.body.phone,
        roles: req.body.roles,
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationCode: token
    })
    // Add account
    user.save((err, user) => {
        if (err) {
            return res.status(500).send(err)
        }

        // nodemailer.sendConfirmationEmail(
        //     user.name,
        //     user.email,
        //     user.confirmationCode
        // )
        return res.status(200).send({ message: `Sign up as ${user.roles} successfully! Please check your email` })
    })


}

//Signin controller
exports.signin = async (req, res) => {

    // Find user then append roles from role id
    const user = await User.findOne({
        email: req.body.email
    })

    // If email is not found
    if (!user) {
        return res.status(404).send({ message: "Email not found!" })
    }

    // Compare hash
    let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
    )

    // If password is incorrect
    if (!passwordIsValid) {
        return res.status(401).send({ accessToken: null, message: "Incorrect password" })
    }

    // If user account is not active
    if (user.status != 'Active') {
        return res.status(401).send({ message: "Please check your email to activate this account!" })
    }

    // Generate token if pass all check
    const token = jwt.sign({ userId: user._id, roles: user.roles }, process.env.SECRET)
    return res.status(200).send({
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        accessToken: token
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

                return res.status(200).send(`<h1>Account activation success</h1>`)
            })
        })
        .catch((e) => console.log("error", e))
}

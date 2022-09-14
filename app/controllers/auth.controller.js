const db = require('./../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('./../config/nodemailer.config')
const User = db.user
const PasswordReset = db.passwordreset


//Signup controller
exports.signup = async (req, res) => {

    //If pass the check, generate a token base on email address
    const username = req.body.username.toLowerCase().trim()
    // return res.status(200).send({ rmitEmail })
    const token = jwt.sign({ email: req.body.email.toLowerCase() }, process.env.SECRET)
    const user = new User({
        email: req.body.email.toLowerCase(),
        name: req.body.name.trim(),
        username: username,
        avatarUrl: `https://source.boringavatars.com/beam/120/${username}`,
        gender: req.body.gender,
        dob: req.body.dob,
        snumber: req.body.email.split("@")[0],
        phone: req.body.phone,
        isAdmin: req.body.isAdmin || false,
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationCode: token
    })
    // Add account
    user.save((err, user) => {
        if (err) {
            return res.status(500).send(err)
        }

        nodemailer.sendConfirmationEmail(
            user.name,
            user.email,
            user.confirmationCode
        )
        return res.status(200).send({ message: `Sign up successfully! Please check your email` })
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
    if (user.accstatus === 'Pending') {
        return res.status(401).send({ message: "Please check your email to activate this account!" })
    }
    if (user.accstatus === 'Banned') {
        return res.status(403).send({ message: "Your account has been banned!" })
    }

    // Generate token if pass all check
    const token = jwt.sign({ userId: user._id, roles: user.roles }, process.env.SECRET)
    return res.status(200).send({
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        roles: user.isAdmin ? "admin" : "user",
        accessToken: token
    })
}


//Email verification controller
exports.verifyUser = async (req, res) => {
    try {
        const user = await User.findOne({ confirmationCode: req.params.confirmationCode })
        if (!user) {
            return res.status(404).send(`<h1>User not found or this action is expired!</h1>`)
        }
        user.accstatus = "Active"
        await user.save()
        return res.status(200).send(`<h1>Account activation success</h1>`)
    } catch (error) {
        return res.status(500).send(error)
    }
}

// Password reset init - send email
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() })
        if (!user) {
            return res.status(404).send({ message: "User not found!" })
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET)
        await PasswordReset.updateOne({ userId: user.id }, { $set: { token: token, userId: user.id } }, { upsert: true })

        nodemailer.sendPasswordResetEmail(user.name, user.email, token)
        return res.status(200).send({ message: "Please check your email for password reset instruction" })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }

}

// Password reset verify and reset password
exports.verifyPasswordReset = async (req, res) => {
    try {
        const token = req.params.token
        let decoded = jwt.verify(token, process.env.SECRET)

        const pwrstoken = await PasswordReset.findOne({ userId: decoded.userId })
        if (!pwrstoken) {
            return res.send(`<h2>Error this action is expired, please make another request</h2>`)
        }

        const params = {

            Message: `${decoded.email}`,
            token: token
        }
        return res.render('resetpw', params)
    } catch (error) {
        return res.status(500).send(`<h2>Error ${error.message}</h2>`)
    }


}

exports.resetPasswordPayload = async (req, res) => {
    try {
        const token = req.params.token
        const pwResetToken = await PasswordReset.findOne({ token: token })
        if (!pwResetToken) {
            return res.status(404).send(`<h2>Error: Token not found on the server</h2>`)
        }

        const user = await User.findById(pwResetToken.userId)
        if (!user) {
            return res.status(404).send(`<h2>Error: User not found</h2>`)
        }
        const passwordTest = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
        if (!passwordTest.test(req.body.password)) {
            return res.send("Password is not match format")
        }

        user.password = bcrypt.hashSync(req.body.password, 8)
        await pwResetToken.delete()
        console.log(req.body)
        await user.save()
        return res.send(`<h2>Password change success!</h2>`)
    } catch (error) {
        return res.status(500).send(`<h2>Error: ${error.message}</h2>`)
    }

}


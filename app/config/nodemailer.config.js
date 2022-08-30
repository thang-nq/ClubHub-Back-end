//Config for email verification
const nodemailer = require('nodemailer')
const env = require('dotenv')

env.config()

const user = process.env.EMAIL
const password = process.env.EMAILPW
console.log("Mail:", user, password)

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: user,
        pass: password
    }
})

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log('Sent email')
    transport.sendMail({
        from: user,
        to: email,
        subject: "RMIT Club Hub Account Verification",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${name}</h2>
        <p>Thank you for registering. Please confirm your email by clicking on the following link</p>
        <a href=https://rmit-club-dhyty.ondigitalocean.app/api/auth/confirm/${confirmationCode}> Click here</a>
        </div>`
    })
}

module.exports.sendPasswordResetEmail = (name, email, passwordResetToken) => {
    console.log('Sent password reset email')
    transport.sendMail({
        from: user,
        to: email,
        subject: "RMIT ClubHub Password Reset",
        html: `<h1>Password Reset</h1>
        <h2>Hello ${name}</h2>
        <p>You just requested an password reset. Please click the button below to reset your password, this action will expire after 5 minutes.</p>
        <a href=http://localhost:8080/api/auth/password-reset/${passwordResetToken}> Click here</a>
        </div>`

    })
}
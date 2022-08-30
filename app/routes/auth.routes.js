const { verifySignUp, sanitize, authJwt } = require('./../middleware')
const controller = require('./../controllers/auth.controller')
const Router = require('express').Router();


//signup route
//Add Sanitize all req for signup and signin
Router.post(
    "/signup",
    [
        // sanitize.sanitizeSignupRequest,
        verifySignUp.checkDuplicateEmail,
        verifySignUp.checkDuplicateUsername
    ],
    controller.signup
)

//signin route
Router.post(
    "/signin",
    // sanitize.sanitizeSigninRequest,
    controller.signin
)

//Email verification route
Router.get(
    "/confirm/:confirmationCode", controller.verifyUser
)

// Request password reset and send email
Router.post("/password-reset", sanitize.sanitizePasswordReset, controller.resetPassword)

//Password reset form render
Router.get("/password-reset/:token", controller.verifyPasswordReset)

//Send password reset payload
Router.post("/password-reset/confirm/:token", controller.resetPasswordPayload)

module.exports = Router
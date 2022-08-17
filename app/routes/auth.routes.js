const { verifySignUp } = require('./../middleware')
const controller = require('./../controllers/auth.controller')

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Authorization, Origin, Content-Type, Accept"
        )
        next()
    })

    //signup route
    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateEmail,
            verifySignUp.checkValidRole
        ],
        controller.signup
    )

    //signin route
    app.post(
        "/api/auth/signin",
        controller.signin
    )

    //Email verification route
    app.get(
        "/api/auth/confirm/:confirmationCode", controller.verifyUser
    )
}
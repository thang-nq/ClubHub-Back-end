//Only for testing authentication & authorization

const { authJwt } = require('./../middleware')
const controller = require('./../controllers/user.controller')
const Router = require("express").Router()


Router.get("/all", controller.allAccess)


Router.get("/clubprez", [authJwt.verifyToken, authJwt.isClubPrez], controller.clubprezBoard)

Router.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard)

//Get all user
Router.get("/users", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers)

//Get a user
Router.get("/user", authJwt.verifyToken, controller.getUser)

module.exports = Router
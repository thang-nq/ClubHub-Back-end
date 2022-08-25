//Only for testing authentication & authorization

const { authJwt } = require('./../middleware')
const controller = require('./../controllers/user.controller')
const Router = require("express").Router()


//Get all user
Router.get("/users", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers)

// User - get personal information
Router.get("/user", authJwt.verifyToken, controller.getUser)


module.exports = Router
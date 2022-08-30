//Only for testing authentication & authorization

const { authJwt } = require('./../middleware')
const controller = require('./../controllers/user.controller')
const { uploadAvatar } = require('./../handler/handleImagesUpload')
const Router = require("express").Router()


//Get all user
Router.get("/getall", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers)

// User - get personal information
Router.get("/profile", authJwt.verifyToken, controller.getUser)

// Upload user avatar
Router.post("/profile/avatar", [authJwt.verifyToken, uploadAvatar], controller.updateUserAvatar)

// User - Update personal information
Router.put("/user", [authJwt.verifyToken], controller.updateUser)

// test route
Router.get("/", controller.testTemp)

module.exports = Router
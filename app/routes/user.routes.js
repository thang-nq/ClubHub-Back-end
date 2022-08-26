//Only for testing authentication & authorization

const { authJwt } = require('./../middleware')
const controller = require('./../controllers/user.controller')
const { uploadAvatar } = require('./../handler/handleImagesUpload')
const Router = require("express").Router()


//Get all user
Router.get("/users", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers)

// User - get personal information
Router.get("/user", authJwt.verifyToken, controller.getUser)

// Upload user avatar
Router.post("/user/avatar", [authJwt.verifyToken, uploadAvatar], controller.updateUserAvatar)

module.exports = Router
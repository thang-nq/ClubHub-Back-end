const { authJwt } = require('../middleware')
const controller = require('./../controllers/notification.controller')
const Router = require('express').Router()

Router.get("/", authJwt.verifyToken, controller.getNotification)

Router.post("/", controller.createNotify)

module.exports = Router
const controller = require('./../controllers/post.controller')

const Router = require('express').Router()

Router.get("/", controller.getPostList)



module.exports = Router
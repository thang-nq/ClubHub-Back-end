const controller = require('./../controllers/post.controller')
const { authJwt } = require('./../middleware')
const multer = require('multer')
const Router = require('express').Router()

// CRUD

// Get all post
Router.get("/", controller.getPostList)

// Get all post of a user
Router.get("/search", authJwt.verifyToken, controller.getUserPosts)

// Create a post (need accessToken)
Router.post("/", [multer().none(), authJwt.verifyToken], controller.createNewPost)

// View a post
Router.get("/:postId", controller.getPost)

// Delete a post (require token)
Router.delete("/:postId", authJwt.verifyToken, controller.deletePost)



// Interaction routes

// Like a post - require accessToken
Router.post("/like", authJwt.verifyToken, controller.likePost)






module.exports = Router
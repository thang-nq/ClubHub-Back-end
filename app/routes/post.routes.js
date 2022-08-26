const controller = require('./../controllers/post.controller')
const { authJwt, imageUpload } = require('./../middleware')
const Router = require('express').Router()
const { uploadImages } = require('./../handler/handleImagesUpload')


// CRUD

// Get all post
Router.get("/", controller.getPostList)

// Search post
Router.get("/search", controller.getUserPosts)

// Create a post (need accessToken)
Router.post("/", [authJwt.verifyToken, uploadImages], controller.createNewPost)

// View a post
Router.get("/:postId", controller.getPost)

// Delete a post (require token)
Router.delete("/:postId", authJwt.verifyToken, controller.deletePost)



// Interaction routes

// Like a post - require accessToken
Router.post("/like", authJwt.verifyToken, controller.likePost)






module.exports = Router
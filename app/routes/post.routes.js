const controller = require('./../controllers/post.controller')
const { authJwt, imageUpload } = require('./../middleware')
const Router = require('express').Router()
const { uploadImages } = require('./../handler/handleImagesUpload')


// CRUD

// Get all post
Router.get("/", controller.getPostList)

// Search post
Router.get("/search", controller.getUserPosts)

// Create a club post 
Router.post("/clubs/:clubId", [authJwt.verifyToken, authJwt.isClubCW, authJwt.isClubMember, uploadImages], controller.createNewClubPost)

// Create a normal post 
Router.post("/", [authJwt.verifyToken, uploadImages], controller.createNewPost)
// View a post
Router.get("/:postId", controller.getPost)

// Update a post
Router.put("/:postId", [authJwt.verifyToken, uploadImages], controller.updatePost)

// Delete a post 
Router.delete("/:postId", authJwt.verifyToken, controller.deletePost)



// Interaction routes

// Like a post - require accessToken
Router.get("/:postId/like", authJwt.verifyToken, controller.likePost)






module.exports = Router
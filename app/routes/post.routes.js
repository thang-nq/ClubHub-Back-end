const controller = require('./../controllers/post.controller')
const { authJwt, imageUpload } = require('./../middleware')
const Router = require('express').Router()
const { uploadImages } = require('./../handler/handleImagesUpload')


// CRUD

// Get all post
Router.get("/", [authJwt.verifyToken], controller.getPostList)

// Search post
Router.get("/search", [authJwt.verifyToken], controller.getUserPosts)

// Create a club post 
Router.post("/clubs/:clubId", [authJwt.verifyToken, authJwt.isClubCW, authJwt.isClubMember, uploadImages], controller.createNewClubPost)

// Get all post of a club
Router.get("/clubs/:clubId", [authJwt.verifyToken], controller.getClubPosts)

// Create a normal post 
Router.post("/", [authJwt.verifyToken, uploadImages], controller.createNewPost)
// View a post
Router.get("/:postId", controller.getPost)

// Update a post
Router.put("/:postId", [authJwt.verifyToken, uploadImages], controller.updatePost)

// Update club post (club president or content writer, can only update post from the club)
Router.put("/clubs/:postId", [authJwt.verifyToken, authJwt.isClubCW, uploadImages], controller.updateClubPost)

// Delete a post
Router.delete("/:postId", authJwt.verifyToken, controller.deletePost)

// delete a club post
Router.delete("/clubs/:postId", authJwt.verifyToken, authJwt.isClubCW, controller.deleteClubPost)



// Interaction routes

// Like a post - require accessToken
Router.get("/:postId/like", authJwt.verifyToken, controller.likePost)






module.exports = Router
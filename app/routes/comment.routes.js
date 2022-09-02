const commentController = require('./../controllers/comment.controller');
const { authJwt } = require('./../middleware')
const router = require('express').Router();

// add comment
router.post("/", authJwt.verifyToken, commentController.addComment);

// Get all comments
router.get("/", commentController.getAllComments);

// Get a comment
router.get("/:id", commentController.getOne)

// Delete a comment
router.delete("/:id", authJwt.verifyToken, commentController.deleteComment);

// Update a comment
router.put("/:id", authJwt.verifyToken, commentController.updateComment);

module.exports = router;
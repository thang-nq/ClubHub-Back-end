const commentController = require('./../controllers/comment.controller');
const { authJwt } = require('./../middleware')
const router = require('express').Router();

// add comment
router.post("/", authJwt.verifyToken, commentController.addComment);

router.get("/", commentController.getAllComments);

router.delete("/:id", authJwt.verifyToken, commentController.deleteComment);

router.put("/:id", authJwt.verifyToken, commentController.updateComment);

module.exports = router;
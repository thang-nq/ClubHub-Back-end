const commentController = require('./../controllers/comment.controller');
const router = require('express').Router();

// add comment
router.post("/",commentController.addComment);

router.get("/",commentController.getAllComments);

router.delete("/:id", commentController.deleteComment);

router.put("/:id", commentController.updateComment);

module.exports = router;
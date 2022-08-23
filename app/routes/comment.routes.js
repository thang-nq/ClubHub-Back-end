const commentControllers = require('../controllers/comment.controller');
const router = require('express').Router();

// add new comment
router.post("/", commentControllers.addComment);

module.exports = router;

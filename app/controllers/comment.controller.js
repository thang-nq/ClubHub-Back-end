const {Comments} = require('../models/comment.model');

const commentControllers = {
    // add new comment
    addComment : async (req,res) => {
        try {
            const newComment = new Comments(req.body);
            const saveComment = await newComment.save();
            res.status(200).json(saveComment);
        } catch (error) {
            res.status(500).send.json(err);
        }

    }
}

module.exports = commentControllers;
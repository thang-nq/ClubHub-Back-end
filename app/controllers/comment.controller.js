const {Comment} = require('./../models/Comment/comment.model');

const commentController = {
    // adComments
    addComment: async(req,res) => {
        try {
            const newComment = new Comment(req.body);
            const saveComment = await newComment.save();
            res.status(200).json(saveComment);
        } catch (error) {
            res.status(500).json(error)
        }
    },

    // getComments
    getAllComments: async (req, res) => { 
        try {
            // const comments = await Comment.find().populate('user');
            const comments = await Comment.find();
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json(err); 
        }
    },

    //  update comments

    updateComment: async(req,res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            await comment.updateOne({$set: req.body});
            res.status(200).json("update successfully !");
        } catch (error) {
            res.status(500).json(err);
        }
    },

    deleteComment: async (req, res) => {
        try {
            await Comment.findByIdAndDelete(req.params.id);
            res.status(200).json("success");
        } catch (error) {
            res.status(500).json(err);
        }
    },
    
    
};

module.exports = commentController;

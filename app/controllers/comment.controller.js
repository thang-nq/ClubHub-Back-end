const { Comment } = require("./../models/Comment/comment.model");

const { handler } = require("./../handler/handler");
const Post = require("../models/Post/post.model");
const User = require("../models/auth/user.model");

const commentController = {
  // adComments
  addComment: async (req, res) => {
    try {
      // check post id and user id
      const post = await Post.findById(req.body.post);
      const user = await User.findById(req.userId);
      if (!post) {
        console.log("post id is not valid");
        return res.status(404).json(err);
      }
      // add new comment
      const newComment = new Comment({
        post: post._id,
        content: req.body.content,
        author: user._id
      });
      newComment.createAt = handler.getCurrentTime();
      const saveComment = await newComment.save();
      await post.updateOne({ $push: { comments: saveComment._id } });
      return res.status(200).send(saveComment);
    } catch (error) {
      return res.status(500).send({ error: error });
    }
  },

  // get all comments
  getAllComments: async (req, res) => {
    try {
      const comments = await Comment.find();
      res.status(200).send(comments);
    } catch (error) {
      res.status(500).json(err);
    }
  },

  //  Update comments
  updateComment: async (req, res) => {
    try {
      //Check if comment exist
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).send({ message: "Error, comment not found!" })
      }

      // check if the user is the author of comment

      if (req.userId != comment.author.toString()) {
        return res.status(404).json("Error, you can't update other person comment");
      }
      await comment.updateOne({ $set: { "content": req.body.content } });
      return res.status(200).json("update successfully !");
    } catch (error) {
      return res.status(500).json(err);
    }
  },


  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json("comment not found");
      }
      // check user role and user id for edit
      const ownerID = comment.author.toString();

      if (req.userId != ownerID) {
        console.log("user don't have permission to edit");
        return res.status(404).json(err);
      }

      await Comment.findByIdAndDelete(req.params.id);
      return res.status(200).json("delete Success");
    } catch (error) {
      return res.status(500).json(err);
    }
  },
};

module.exports = commentController;

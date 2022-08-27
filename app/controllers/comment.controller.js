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
      const user = await User.findById(req.body.author);
      if (!post || !user) {
        console.log("post id or user id not valid");
        return res.status(404).json(err);
      }
      // add new comment
      const newComment = new Comment(req.body);
      newComment.createAt = handler.getCurrentTime();
      const saveComment = await newComment.save();
      if (req.body.post) {
        const post = await Post.findById(req.body.post);
        await post.updateOne({ $push: { comments: saveComment._id } });
      }
      return res.status(200).json(saveComment);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  // getComments
  getAllComments: async (req, res) => {
    try {
      const comments = await Comment.find();
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json(err);
    }
  },

  //  Update comments
  updateComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      // check user role and user id for edit
      const user = await User.findById(req.body.editor);
      const ownerID = comment.author.toString();

      if (user.id != ownerID && user.roles != "admin") {
        console.log("user don't have permission to edit");
        return res.status(404).json("failed");
      }
      await comment.updateOne({ $set: req.body });
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
      const user = await User.findById(req.body.editor);
      const ownerID = comment.author.toString();

      if (user.id != ownerID && user.roles != "admin") {
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

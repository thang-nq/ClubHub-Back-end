const db = require('./../models')
const Comment = db.comment
const { handler } = require("./../handler/handler");
const Post = db.post
const User = db.user

const commentController = {
  // adComments
  addComment: async (req, res) => {
    try {
      // check post id and user id
      const post = await Post.findById(req.body.post);
      if (!post) {
        return res.status(404).send({ message: "Post is not found" });
      }
      // add new comment
      console.log(post)
      const newComment = new Comment({
        post: req.body.post,
        content: req.body.content,
        author: req.userId
      });
      newComment.createAt = handler.getCurrentTime();
      console.log(newComment)
      //Save comment and link to post
      await newComment.save();

      post.comments.push(newComment._id)
      await post.save()
      //Success
      return res.status(200).send(newComment);
    } catch (error) {
      return res.status(500).send({ error: "Server error" });
    }
  },

  // get all comments
  getAllComments: async (req, res) => {
    try {
      const comments = await Comment.find();
      return res.status(200).send(comments);
    } catch (error) {
      return res.status(500).send(error);
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
      return res.status(200).send({ message: "Update comment successfully" });
    } catch (error) {
      return res.status(500).send(error);
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
        return res.status(404).send({ message: "You dont have the permission to delete" });
      }

      await Comment.findByIdAndDelete(req.params.id);

      return res.status(200).send({ message: "Delete success!" })
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};

module.exports = commentController;

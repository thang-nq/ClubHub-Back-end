const db = require('./../models')
const Comment = db.comment
const { handler } = require("./../handler/handler");
const Post = db.post
const User = db.user

const commentController = {
  // get a comment
  getOne: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id).populate("author", "username avatarUrl")
      if (!comment) {
        return res.status(404).send({ message: "Error, comment not found!" })
      }
      return res.status(200).send(comment)
    } catch (error) {
      return res.status(500).send({ message: error })
    }
  },



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
      if (!req.body.content) {
        return res.status(401).send({ message: "Error, comment content is empty" })
      }
      comment.content = req.body.content
      comment.updateAt = handler.getCurrentTime()
      await comment.save()
      return res.status(200).send({ message: "Update comment successfully", updatedContent: comment.content });
    } catch (error) {
      return res.status(500).send(error);
    }
  },


  // Delete a comment
  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).send({ message: "Error! Comment not found!" });
      }
      // check user role and user id for edit
      const ownerID = comment.author.toString();

      if (req.userId != ownerID) {
        return res.status(404).send({ message: "You dont have the permission to delete this comment (not the author)" });
      }

      await Comment.findByIdAndDelete(req.params.id);
      // Delete comment from post
      await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment.id } })

      return res.status(200).send({ message: "Delete success!", deleteContent: comment.content })
    } catch (error) {
      return res.status(500).send(error);
    }
  },
};

module.exports = commentController;

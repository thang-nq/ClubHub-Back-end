const db = require('./../models')
const Post = db.post


exports.getPostList = (req, res) => {
    return res.status(200).send({ message: "Post route" })
}

exports.createNewPost = (req, res) => {

}

exports.updatePost = (req, res) => {

}

exports.deletePost = (req, res) => {

}
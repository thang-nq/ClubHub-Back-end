const db = require('./../models')
const handler = require('./../handler/handler')
const Post = db.post
const User = db.user

// Get a post by id
exports.getPost = async (req, res) => {
    const post = await Post.findById(req.params.postId)
    if (!post) {
        return res.status(404).send({ message: "Post is not found" })
    }
    return res.status(200).send(post)
}

// Get all post
exports.getPostList = async (req, res) => {
    const postList = await Post.find()
    return res.status(200).send(postList)
}


// Get all post from a user
exports.getUserPosts = async (req, res) => {
    const postList = await Post.find({ author: req.userId })
    return res.status(200).send(postList)
}


// Add new post
exports.createNewPost = async (req, res) => {
    try {
        console.log(req.userId)
        console.log(req.body)
        const newPost = new Post({
            author: req.userId,
            content: req.body.content,
            images: req.body.images
        })
        newPost.createAt = handler.getCurrentTime()
        const user = await User.findById(req.userId)
        if (!user) {
            console.log("author not found")
            return res.status(404).send({ message: "Couldn't create post, user does not exist" })
        }
        console.log('found author')
        newPost.authorUsername = user.username
        const savedPost = await newPost.save()
        return res.status(200).send(savedPost)
    } catch (err) {
        return res.status(500).send(err)
    }

}

// Add like to the post, will unlike the post if that user already like it
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.body.postId)
        if (!post) {
            return res.status(404).send({ message: "Failed! Post not found on the server" })
        }

        // Check if user already like the post
        for (let i = 0; i < post.likes.length; i++) {

            // Convert Mongodb ObjectID to String before comparing with another string
            if (req.userId === post.likes[i].toString()) {
                console.log("already like")
                await post.updateOne({ $pull: { likes: req.userId } })
                return res.status(200).send({ message: "Unlike post successfully" })
            }
        }

        // Add like to the post if the userId is not in the likes array
        await post.updateOne({ $push: { likes: req.userId } })
        return res.status(200).send({ message: "Like post successfully" })
    } catch (error) {
        return res.status(500).send(error)
    }
}


// Update post content and images only, only author are allowed to update
exports.updatePost = (req, res) => {

}


// Delete a post by id, only author are allowed to delete
exports.deletePost = async (req, res) => {
    try {
        const postToDelete = await Post.findById(req.params.postId)
        if (!postToDelete) {
            return res.status(404).send({ message: "Delete failed! Post not found" })
        }
        // Convert mongodb objectid to string before compare
        if (req.userId === postToDelete.author.toString()) {
            postToDelete.delete()
            return res.status(200).send({ message: "Delete post successful" })
        }

        return res.status(402).send({ message: `Delete post ${req.params.postId} unsuccessful` })
    } catch (err) {
        return res.status(500).send({ message: err })
    }

}
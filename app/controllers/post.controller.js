const db = require('./../models')
const { handler } = require('./../handler/handler')

const multer = require('multer')
const Post = db.post
const User = db.user




// Get a post by id
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate("author", "username avatarUrl")
        await post.populate({
            path: "comments",
            select: "author content createAt",
            populate: {
                path: "author",
                model: "User",
                select: "username avatarUrl"
            }

        })
        if (!post) {
            return res.status(404).send({ message: "Post is not found" })
        }
        return res.status(200).send(post)
    } catch (error) {
        return res.status(500).send(error)
    }
}

// Get all post
exports.getPostList = async (req, res) => {
    try {
        const postList = await Post.find().populate("author", "username avatarUrl").populate({
            path: "comments",
            select: "author content createAt",
            populate: {
                path: "author",
                model: "User",
                select: "username avatarUrl"
            }

        })

        return res.status(200).send(postList)
    } catch (err) {
        return res.status(500).send(err)
    }
}


// Get all post from a user by username
exports.getUserPosts = async (req, res) => {
    try {
        const username_query = req.query.username.toLowerCase()
        if (!username_query) {
            return res.status(401).send({ message: "Missing query params" })
        }
        const postList = await Post.find({ authorUsername: username_query }).populate("likes", "username")
        return res.status(200).send(postList)
    } catch (err) {
        return res.status(500).send({ message: `Error! ${err.message}` })
    }
}





// Add new post
exports.createNewPost = async (req, res) => {
    try {

        const uploadData = req.files
        const imageURLs = []
        if (uploadData) {
            uploadData.forEach(imgData => {
                imageURLs.push(imgData.location)
            })
        }

        // Create post
        const newPost = new Post({
            author: req.userId,
            content: req.body.content,
            location: req.body.location,
            images: imageURLs
        })
        newPost.createAt = handler.getCurrentTime()
        const user = await User.findById(req.userId)
        if (!user) {
            console.log("author not found")
            return res.status(404).send({ message: "Couldn't create post, user does not exist" })
        }


        const savedPost = await newPost.save()
        console.log(`A new post has been created by ${user.username}`)
        return res.status(200).send(savedPost)
    } catch (err) {
        return res.status(500).send({ message: err })
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
        const awsKeyToDetele = []
        if (!postToDelete) {
            return res.status(404).send({ message: "Delete failed! Post not found" })
        }
        // Convert mongodb objectid to string before compare
        if (req.userId === postToDelete.author.toString()) {
            postToDelete.delete()
            awsKeyToDetele = postToDelete.images

            return res.status(200).send({ message: "Delete post successful" })
        }


        return res.status(402).send({ message: `Delete post ${req.params.postId} unsuccessful` })
    } catch (err) {
        return res.status(500).send({ message: err })
    }

}
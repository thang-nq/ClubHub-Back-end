const db = require('./../models')
const { handler } = require('./../handler/handler')
const { deleteImage } = require('./../handler/handleImagesUpload')

const multer = require('multer')
const Post = db.post
const User = db.user




// Get a post by id
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate("author", "username avatarUrl")
        if (!post) {
            return res.status(404).send({ message: "Post is not found" })
        }
        await post.populate({
            path: "comments",
            select: "author content createAt",
            populate: {
                path: "author",
                model: "User",
                select: "username avatarUrl"
            }

        })

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





// Content writer, admin add new post for a club
exports.createNewClubPost = async (req, res) => {
    try {
        console.log(req.files)
        const uploadData = req.files
        const imageURLs = []
        // Check If the user upload images
        if (uploadData) {
            uploadData.forEach(imgData => {
                imageURLs.push({ url: imgData.location, key: imgData.key })
            })
        }

        // Create post
        const newPost = new Post({
            author: req.userId,
            club: req.params.clubId,
            content: req.body.content,
            location: req.body.location,
            images: imageURLs
        })

        newPost.createAt = handler.getCurrentTime()
        newPost.viewMode = req.body.viewMode || "public"

        newPost.save((err, result) => {
            if (err) {
                if (imageURLs.length > 0) {
                    imageURLs.forEach(imgData => {
                        deleteImage(imgData.key)
                    })
                }
                return res.status(500).send({ message: err })
            }

            return res.status(200).send(result)
        })

    } catch (err) {
        return res.status(500).send(err)
    }

}


// Normal user create a post
exports.createNewPost = async (req, res) => {
    try {

        const uploadData = req.files
        const imageURLs = []
        // Check If the user upload images
        if (uploadData) {
            uploadData.forEach(imgData => {
                imageURLs.push({ url: imgData.location, key: imgData.key })
            })
        }

        // Create post
        const newPost = new Post({
            author: req.userId,
            club: req.body.clubId,
            content: req.body.content,
            location: req.body.location,
            images: imageURLs
        })
        newPost.createAt = handler.getCurrentTime()
        newPost.viewMode = req.body.viewMode.toLowerCase().trim() || "public"
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
exports.updatePost = async (req, res) => {
    try {
        // If the user also change images
        const uploadData = req.files
        const imageURLs = []
        if (uploadData) {
            uploadData.forEach(imgData => {
                imageURLs.push({ url: imgData.location, key: imgData.key })
            })
        }
        const postToUpdate = await Post.findById(req.params.postId)
        // Check if post exist
        if (!postToUpdate) {
            return res.status(404).send({ message: "Error! Post not found" })
        }

        // Check if the user is the author
        if (req.userId != postToUpdate.author._id.toString()) {
            return res.status(403).send({ message: "Error! You are not the post author" })
        }
        postToUpdate.content = req.body.content
        postToUpdate.location = req.body.location
        postToUpdate.updateAt = handler.getCurrentTime()
        // Delete old images on the s3 server if user update the images
        if (imageURLs.length > 0) {
            postToUpdate.images.forEach(image => {
                const result = deleteImage(image.key)
                console.log(result)
            })
            postToUpdate.images = imageURLs
        }

        // Save post 
        const post = await postToUpdate.save()
        return res.status(200).send({
            message: "Update sucessfully",
            content: post
        })

    } catch (error) {
        return res.status(500).send({ message: error })
    }
}


// Delete a post by id, only author are allowed to delete, also delete the images on s3
exports.deletePost = async (req, res) => {
    try {
        const postToDelete = await Post.findById(req.params.postId)
        if (!postToDelete) {
            return res.status(404).send({ message: "Delete failed! Post not found" })
        }
        // Convert mongodb objectid to string before compare
        if (req.userId === postToDelete.author.toString()) {
            //Delete the images from s3
            postToDelete.images.forEach(image => {
                deleteImage(image.key)
            })

            const data = await postToDelete.delete()


            return res.status(200).send({ message: "Delete post successful", deleted: data })
        }


        return res.status(402).send({ message: `Delete post ${req.params.postId} unsuccessful` })
    } catch (err) {
        return res.status(500).send({ message: err })
    }

}




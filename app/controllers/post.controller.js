const db = require('./../models')
const { handler } = require('./../handler/handler')
const { deleteImage } = require('./../handler/handleImagesUpload')

const multer = require('multer')
const Club = require('../models/Club/club.model')
const Post = db.post
const User = db.user
const Comment = db.comment



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
        const user = await User.findById(req.userId)
        let clubIdArray = []
        user.clubs.forEach(club => {
            clubIdArray.push(club.club)
        })

        const posts = await Post.find({ club: { "$in": clubIdArray } }).sort({ createAt: -1 }).populate("author club", "username avatarUrl name").populate({
            path: "comments",
            select: "author content createAt",
            populate: {
                path: "author",
                model: "User",
                select: "username avatarUrl"
            }

        })



        return res.status(200).send(posts)
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
        const user = await User.findOne({ username: username_query })
        if (!user) {
            return res.status(404).send({ Error: `Username ${username_query} not found on the database!` })
        }
        const postList = await Post.find({ author: user._id }).populate("author", "username avatarUrl").
            populate({
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
        return res.status(500).send({ message: `Error! ${err.message}` })
    }
}

// Get all post from a club
exports.getClubPosts = async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId)
        if (!club) {
            return res.status(404).send({ Error: "Club not found!" })
        }

        const viewMode = ["public"]
        const user = await User.findById(req.userId)
        user.clubs.forEach(club => {
            if (club.club.toString() === req.params.clubId) {
                viewMode.push("internal")
            }
        })


        const posts = await Post.find({ club: req.params.clubId, viewMode: { "$in": viewMode } }).populate("author club", "username name avatarUrl")
            .populate({
                path: "comments",
                select: "author content",
                populate: {
                    path: "author",
                    select: "username avatarUrl"
                }
            })


        return res.status(200).send(posts)


    } catch (error) {
        return res.status(500).send({ message: error })
    }
}




// Content writer, admin add new post for a club
exports.createNewClubPost = async (req, res) => {
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
        newPost.viewMode = req.body.viewMode || "public"
        const user = await User.findById(req.userId)
        if (!user) {
            console.log("author not found")
            return res.status(404).send({ message: "Couldn't create post, user does not exist" })
        }

        newPost.save((err, result) => {
            if (err) {
                if (imageURLs.length > 0) {
                    imageURLs.forEach(imgData => {
                        deleteImage(imgData.key)
                    })
                }
                return res.status(500).send({ message: err })
            }

            console.log(`A new post has been created by ${user.username}`)
            return res.status(200).send(result)
        })

    } catch (err) {
        return res.status(500).send({ message: err })
    }

}

// Add like to the post, will unlike the post if that user already like it
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
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
            if (imageURLs.length > 0) {
                imageURLs.forEach(image => {
                    deleteImage(image.key)
                })
            }
            return res.status(404).send({ message: "Error! Post not found" })
        }

        // Check if the user is the author
        if (req.userId != postToUpdate.author._id.toString()) {
            if (imageURLs.length > 0) {
                imageURLs.forEach(image => {
                    deleteImage(image.key)
                })
            }
            return res.status(403).send({ message: "Error! You are not the post author" })
        }
        // Update fields and change update time
        postToUpdate.content = req.body.content
        postToUpdate.location = req.body.location
        postToUpdate.updateAt = handler.getCurrentTime()

        // Delete old post images on the s3 server if user update new images
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
            updated: post
        })

    } catch (error) {

        // Delete images if the request failed by server error
        const uploadData = req.files
        if (uploadData) {
            uploadData.forEach(file => {
                deleteImage(file.key)
            })
        }
        return res.status(500).send({ message: error })
    }
}


// Update a club post, need at least content writer permission, and belong to the club
exports.updateClubPost = async (req, res) => {
    try {
        const uploadData = req.files
        const imgUrl = []
        if (uploadData) {
            uploadData.forEach(imgData => {
                imgUrl.push({ url: imgData.location, key: imgData.key })
            })
        }

        // Because the img is already upload to s3 before we can validation (due to the unstable order of multipart - form data)
        // we have to delete the image if validation process failed or any error occur
        const postToUpdate = await Post.findById(req.params.postId)
        if (!postToUpdate) {
            if (imgUrl.length > 0) {
                imgUrl.forEach(img => {
                    deleteImage(img.key)
                })
            }
            return res.status(404).send({ message: "Post not found" })
        }

        const user = await User.findById(req.userId)


        let allowUpdate = false
        // Check writer role of the club, if the user is writer or president, allow them to delete post
        user.clubs.forEach(club => {
            if (club.club.toString() === postToUpdate.club.toString() && (club.role === 'Writer' || club.role === 'President')) {
                allowUpdate = true
            }
        })

        if (!allowUpdate) {
            if (imgUrl.length > 0) {
                imgUrl.forEach(img => {
                    deleteImage(img.key)
                })
            }
            return res.status(403).send({ message: "Error! Cant update post not from your club" })
        }

        postToUpdate.content = req.body.content
        postToUpdate.location = req.body.location
        postToUpdate.updateAt = handler.getCurrentTime()
        // If the update contain images, delete old imgs from s3
        if (imgUrl.length > 0) {
            postToUpdate.images.forEach(image => {
                const result = deleteImage(image.key)
                console.log(result)
            })
            postToUpdate.images = imgUrl
        }

        await postToUpdate.save()
        return res.status(200).send({ message: "update club post success", updatedContent: postToUpdate })

    } catch (error) {
        const uploadData = req.files
        if (uploadData) {
            uploadData.forEach(file => {
                deleteImage(file.key)
            })
        }
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
        if (req.userId !== postToDelete.author.toString()) {
            return res.status(402).send({ message: `Delete post ${req.params.postId} unsuccessful, you are not the author` })
        }


        // Delete images in amazon s3
        postToDelete.images.forEach(image => {
            deleteImage(image.key)
        })

        // Delete comment in comment collection
        const deletedComments = []
        for (const comment of postToDelete.comments) {

            const data = await Comment.findByIdAndDelete(comment)
            console.log(`Deleting comment ${data._id}`)
            deletedComments.push(data.content)
        }



        // Delete post in collection and return data
        const data = await postToDelete.delete()
        return res.status(200).send({ message: "Delete post successful", deleted: data, deletedComment: deletedComments })


    } catch (err) {
        return res.status(500).send({ message: err })
    }

}



// Delete club post
exports.deleteClubPost = async (req, res) => {
    try {
        const postToDelete = await Post.findById(req.params.postId)
        if (!postToDelete) {
            return res.status(404).send({ message: "Error! Post not found" })
        }
        const user = await User.findById(req.userId)

        let allowDelete = false
        // Check writer role of the club, if the user is writer or president, allow them to delete post
        user.clubs.forEach(club => {
            if (club.club.toString() === postToDelete.club.toString() && (club.role === 'Writer' || club.role === 'President')) {
                allowDelete = true
            }
        })

        if (!allowDelete) {
            return res.status(403).send({ message: "Error! Cant delete post not from your club, or you dont have the writer permission" })
        }

        // Check if post contain images, delete them
        if (postToDelete.images.length > 0) {
            postToDelete.images.forEach(image => {
                deleteImage(image.key)
            })
        }


        // Check if post have comments => Delete all comments
        let deletedComments = []
        // Also remember to delete comments
        for (const comment of postToDelete.comments) {
            const data = await Comment.findByIdAndDelete(comment)
            console.log(`Deleting comment ${data._id}`)
            deletedComments.push(data.content)
        }

        // Delete post and send data
        await postToDelete.delete()
        return res.status(200).send({ message: "Delete post successful", deletedComment: deletedComments })

    } catch (error) {
        return res.status(500).send(error)
    }
}




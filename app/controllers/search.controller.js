const db = require('./../models')
const User = db.user
const Post = db.post
const Club = db.club


exports.universalSearch = async (req, res) => {
    try {
        if (!req.body.value) {
            return res.status(400).send({ message: "Empty search value" })
        }
        const payload = req.body.value.trim()
        const clubProjection = { name: 1, clubCategory: 1, logoUrl: 1, backgroundUrl: 1, clubCategory: 1 }
        // const profileProjection = { username: 1, avatarUrl: 1 }

        let clubs = await Club.find({ name: { $regex: new RegExp('^.*' + payload + '.*', 'i') }, status: "Active" }, clubProjection)

        // Future feature
        // let posts = await Post.find({ $or: [{ content: { $regex: new RegExp('^.*' + payload + '.*', 'i') } }, { location: { $regex: new RegExp('^' + payload + '.*', 'i') } }], viewMode: "public" }).populate("author", "username avatarUrl")
        // let profiles = await User.find({ username: { $regex: new RegExp('^' + payload + '.*', 'i') } }, profileProjection)

        return res.status(200).send(clubs)
    } catch (error) {
        return res.status(500).send({ Error: error })
    }
}



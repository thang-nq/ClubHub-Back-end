const { handler } = require('../handler/handler')
const db = require('./../models')
const Nofitication = db.notification

exports.getNotification = async (req, res) => {
    try {
        const notis = await Nofitication.find()
        return res.status(200).send(notis)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}

exports.createNotify = async (req, res) => {
    try {
        const notify = new Nofitication({
            createAt: handler.getCurrentTime(),
            message: "Test notifcation"
        })
        await notify.save()
        return res.status(200).send(notify)
    } catch (error) {
        return res.status(500).send({ message: error })
    }
}